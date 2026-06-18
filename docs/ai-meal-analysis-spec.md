# AI Meal Analysis — Technical Spec

How the meal-photo feature in **Process** turns a photo into calories, macros, and a 0–100 nutrition
score. This is the backend/AI design behind screens 12–14 in [design-prompts.md](design-prompts.md).

## Decisions (locked)

- **Food identification:** Claude vision (identifies dishes + estimates portions).
- **Nutrition numbers:** FatSecret Platform API (authoritative calories/macros per food).
- **Score:** deterministic formula computed on the backend (consistent & explainable).
- **Where it runs:** the app's backend. API keys for Claude and FatSecret are **server-side only**.

---

## 1 · Pipeline

```
App ──(photo + optional details)──► Backend
                                      │
   Step 1  Claude vision ────────────┤  identify food items + estimate portions  → items[]
   Step 2  FatSecret ────────────────┤  per item: search → get nutrition → scale → aggregate
   Step 3  Deterministic scorer ─────┤  compute 0–100 score + band + rationale
   Step 4  Claude (lightweight) ─────┘  one-line friendly tip from final numbers
                                      │
App ◄──(items, calories, macros, score, tip, budget impact)── Backend
```

Re-analysis (user edits items on screen 14): re-run **Steps 2–4 only** (skip vision).

---

## 2 · Step 1 — Vision identification (Claude)

**Goal:** Claude looks at the photo (plus any optional user text) and returns a structured list of food
items, each with an estimated portion and a clean search string for FatSecret. Claude is good at "what's
on the plate and roughly how much"; FatSecret supplies the exact numbers.

**Model:** `claude-opus-4-8` for best accuracy. For high volume, evaluate `claude-sonnet-4-6` (also
vision-capable, ~40% cheaper) — see Cost below.

**Structured output** via `messages.parse()` with a schema (no fragile text parsing). Schema:

```ts
const MealItem = z.object({
  name: z.string(),                              // "Grilled chicken breast"
  fatsecret_query: z.string(),                   // search string, e.g. "grilled chicken breast"
  quantity_grams: z.number(),                    // best estimate in grams
  quantity_display: z.string(),                  // "1 breast (~150 g)"
  confidence: z.enum(["high", "medium", "low"]),
});
const MealVision = z.object({
  is_food: z.boolean(),                          // false → not a meal photo
  dish_name: z.string(),                         // "Chicken salad bowl"
  items: z.array(MealItem),
  overall_confidence: z.enum(["high", "medium", "low"]),
  notes: z.string(),                             // assumptions, e.g. "dressing amount unclear"
});
```

**Call (TypeScript; Python `messages.parse` + Pydantic is 1:1):**

```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic(); // ANTHROPIC_API_KEY from env, server-side only

const res = await client.messages.parse({
  model: "claude-opus-4-8",
  max_tokens: 2000,
  thinking: { type: "adaptive" },
  output_config: { format: zodOutputFormat(MealVision), effort: "medium" },
  system: [{ type: "text", text: VISION_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
  messages: [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
      { type: "text", text: userContext }, // meal type, name, portion hint, notes — or "none"
    ],
  }],
});
const meal = res.parsed_output!; // typed MealVision
```

**VISION_SYSTEM_PROMPT** (outline): "You are a nutrition vision assistant. Identify each distinct food
in the image. For each, give a concise FatSecret search query (generic food name, no brand unless
clearly visible), estimate the portion in grams using visual cues (plate size, utensils, the user's
notes), and a human-readable portion. Prefer separate items over combined. If the image is not food,
set is_food=false. Be honest about uncertainty via confidence and notes. Do not invent calorie numbers —
nutrition is looked up separately."

Notes:
- **Image size:** downscale client- or server-side to ~1024–1568 px on the long edge before sending.
  Full-res images cost more vision tokens with little accuracy gain for food ID.
- **Caching:** the system prompt is stable — `cache_control` caches it. (Opus needs a ≥4096-token prefix
  to cache; if the prompt is smaller it simply won't cache — harmless.)
- **Privacy bonus:** only Claude sees the photo. FatSecret receives **text queries only**, never the image.

---

## 3 · Step 2 — Nutrition resolution (FatSecret)

For each `MealItem`:

1. **`foods.search`** with `fatsecret_query` → candidate foods (pick the top/best-named match).
2. **`food.get.v5`** with the chosen `food_id` → `servings[]` (calories, protein, carb, fat, fiber, sugar,
   sodium, serving size in g/ml).
3. **Scale** a per-100 g (or per-serving) entry to `quantity_grams`.
4. **Aggregate** across items → meal totals: `kcal, protein_g, carb_g, fat_g, fiber_g, sugar_g, sodium_mg`.

**FatSecret integration facts (verified):**
- **Auth:** OAuth 2.0 **client-credentials** grant. Exchange Client ID/Secret for a Bearer access token,
  send it as `Authorization: Bearer <token>`. Cache the token until `expires_in`. Scopes: `basic`,
  `premier`, `barcode`, `localization`.
- **Endpoint:** REST at `https://platform.fatsecret.com/rest/server.api` (method + params), JSON format.
- **IP allowlisting is required** — FatSecret only answers from whitelisted IPs (up to 15; CIDR ranges on
  Premier). **The backend needs a stable outbound IP** (NAT gateway / static egress). This rules out
  naive serverless with rotating IPs unless you route egress through a fixed IP.
- **Tiers:** *Basic* = free, **5,000 calls/day**, limited dataset, attribution required. *Premier* = paid,
  no call limit, global data. *Premier Free* = start-ups (<$1M revenue & funding)/non-profits/students —
  US dataset + premium features, attribution required.
- **Add-ons:** Image Recognition and NLP are optional Premier add-ons. (We use Claude for vision, so these
  aren't required — but FatSecret's own image recognition is a possible alternative later.)

**Caching:** cache `food.get` results by `food_id` (nutrition is static) — cuts both latency and call count
against the daily cap. A meal of 4 items ≈ 4 search + 4 get on first sight, far fewer once cached.

**Fallback:** if a query has no FatSecret match, fall back to Claude's own estimate for that item and mark
the item `source: "estimate"` (lower confidence, surfaced on screen 14).

---

## 4 · Step 3 — Nutrition score (deterministic, 0–100)

A transparent, tunable rubric. Each component is scored 0–100, then weighted. Starting weights:

| Component | Weight | Score formula (clamp 0–100) |
|---|---|---|
| Protein adequacy | 25% | `(protein_g per 100 kcal) / 7.5 × 100` |
| Fiber density | 20% | `(fiber_g per 1000 kcal) / 14 × 100` |
| Sugar | 20% | `100 − max(0, %kcal_from_sugar − 10) × 4` |
| Sodium | 15% | `100 − max(0, (sodium_mg/kcal) − 1.0) × 50` |
| Fat balance | 10% | peaks when 20–35% of kcal from fat; falls off outside |
| Calorie fit | 10% | `100 − |kcal − mealBudget| / mealBudget × 100` |

```
score = Σ(componentScore × weight)            // 0–100
band  = score ≥ 75 ? "green" : score ≥ 50 ? "amber" : "red"
```

- `%kcal_from_sugar = sugar_g × 4 / kcal × 100`; `%kcal_from_fat = fat_g × 9 / kcal × 100`.
- If no per-meal calorie budget is set, drop "Calorie fit" and renormalize the other weights.
- **Rationale string:** pick the top 1–2 strongest and the single weakest component →
  "High protein, moderate carbs — low on fiber." (This feeds screen 14's score explanation.)

**Thresholds and weights are deliberately explicit so they can be tuned against real data** — keep them
in config, not hard-coded.

### Daily score (0–100)

```
mealQuality     = calorie-weighted average of each meal's score
budgetAdherence = how close the day's totals are to targets (calories + the 3 macros), 0..1
dailyScore      = clamp(0.7 × mealQuality + 0.3 × (budgetAdherence × 100), 0, 100)
```

Same red/amber/green banding. Powers the diary's daily score (screen 12) and Home's nutrition card.

---

## 5 · Daily calorie & macro budget (from goal weight)

Targets are auto-derived (the "budget from goal" decision), adjustable in Settings → Nutrition targets.

```
BMR (Mifflin-St Jeor):
  men:   10·kg + 6.25·cm − 5·age + 5
  women: 10·kg + 6.25·cm − 5·age − 161
TDEE = BMR × activity        // 1.2 sedentary · 1.375 light · 1.55 moderate · 1.725 very active
calorieTarget = goal is loss ? TDEE − deficit : TDEE
  deficit ≈ 500 kcal/day per ~0.5 kg/week; floor target at ~1200 (F) / ~1500 (M)
Macros:
  protein_g = 1.8 × kg        // higher protein supports fat loss + satiety
  fat_g     = 0.8 × kg        // (or ~25–30% of kcal)
  carb_g    = (calorieTarget − protein_g×4 − fat_g×9) / 4
```

**Inputs needed:** sex, age, height, activity level, current & goal weight — all collected during
onboarding (the Starting & Goal Weight screen) and editable in Settings → Nutrition targets. If any are
missing, fall back to a suggested default the user can override. Per-meal budget ≈ daily budget split
across logged meal types (e.g. 25/35/30/10%).

---

## 6 · Step 4 — Tip & rationale (Claude, lightweight)

After final numbers exist, one cheap text-only call turns the nutrient profile + score into a friendly,
actionable line (grounded in the *real* numbers, not the photo estimate).

```ts
const Tip = z.object({ rationale: z.string(), tip: z.string() });
const tip = await client.messages.parse({
  model: "claude-haiku-4-5",          // cheapest; tip is short
  max_tokens: 300,
  output_config: { format: zodOutputFormat(Tip) },
  system: [{ type: "text", text: TIP_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
  messages: [{ role: "user", content: JSON.stringify({ totals, score, band, targets }) }],
});
```

`TIP_SYSTEM_PROMPT`: "Given a meal's nutrition totals, its 0–100 score, and the user's targets, write a
short plain-language rationale (one clause) and a single encouraging, actionable tip. Calm and positive —
never shaming." Example tip: "Great protein — add a side of greens to boost fiber and your score."

---

## 7 · Data model (sketch)

- **meals**: `id, user_id, photo_url, meal_type, eaten_at, dish_name, notes, kcal, protein_g, carb_g,
  fat_g, fiber_g, sugar_g, sodium_mg, score, band, rationale, tip, overall_confidence`
- **meal_items**: `id, meal_id, name, fatsecret_food_id, quantity_grams, kcal, protein_g, carb_g, fat_g,
  fiber_g, sugar_g, sodium_mg, source ("fatsecret" | "estimate"), edited_by_user`
- **nutrition_targets**: `user_id, kcal, protein_g, carb_g, fat_g, derived_from_goal, sex, age, height_cm,
  activity` (nullable demographics)
- Daily totals/score: compute on read from `meals` for a date, or cache in a `daily_summary` row.

## 8 · Backend endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/meals/analyze` | multipart image + optional fields → run Steps 1–4, return draft analysis (not yet saved) |
| POST | `/meals` | save a confirmed meal |
| PUT | `/meals/:id` | edit items → re-run Steps 2–4 |
| GET | `/meals?date=YYYY-MM-DD` | diary for a day (+ daily totals & score) |
| GET/DELETE | `/meals/:id` | view / delete |
| GET/PUT | `/nutrition/targets` | read / override budget |

All require app-user auth (e.g. JWT). Claude + FatSecret credentials never leave the server.

## 9 · Cost & latency (ballpark)

Per analysis = 1 vision call + N FatSecret calls (cached after first sight) + 1 tiny tip call.
Pricing (per 1M tokens): Opus 4.8 $5 in / $25 out · Sonnet 4.6 $3 / $15 · Haiku 4.5 $1 / $5. A vision call
is roughly an image (~1.3–1.6k tokens at ~1024–1568 px) + ~0.5k prompt + ~0.5k structured output. Order of
magnitude: **a few US cents per scan on Opus, ~half that on Sonnet**, plus a fraction of a cent for the
Haiku tip. FatSecret cost depends on tier (Basic free up to 5k/day). **Recommendation:** Sonnet 4.6 for
vision at scale, Haiku 4.5 for the tip, Opus 4.8 if you want maximum identification accuracy. Latency is
dominated by the vision call (a few seconds) — hence the "Reading your plate…" analyzing state (screen 13).

## 10 · Edge cases & reliability

- **Not food** (`is_food=false`) → friendly "That doesn't look like a meal — try again?" (screen 13/14).
- **Low confidence** → screen 14 banner "Not sure about this one — tap items to correct."
- **FatSecret miss** → Claude-estimate fallback, item flagged `source: "estimate"`.
- **Composite dishes** (curry, sandwich) → Claude may return components or one combined item; both resolve.
- **Portion ambiguity** → Claude estimates; the user adjusts on screen 14 → re-analyze.
- **Timeouts / rate limits** → SDKs auto-retry with backoff; surface a calm error + "Save without analysis".
- **Cost/abuse guard** → per-user rate limit on `/meals/analyze`; optional dedupe by image hash.

## 11 · Security & privacy

- Claude + FatSecret keys are server-side only (the chosen architecture).
- FatSecret **IP allowlist** → run the backend behind a static egress IP / NAT.
- Validate image type & size; cap upload size; authenticate every endpoint.
- Photos are personal data: store privately (signed URLs), let users delete, and disclose that meal photos
  are processed by Claude for analysis. FatSecret only ever receives food-name text.

---

*Model IDs, vision input format, `messages.parse` structured output, and pricing verified against the
Claude API reference. FatSecret auth/endpoints/tiers/limits verified against platform.fatsecret.com.*
