# Process — Design Prompts

Beautiful, inspiring design prompts for **Process**, an Android habit-tracking app for weight management.

> **Philosophy:** *Real change happens only by following the process daily.*

- **Platform:** Android · Material 3 (Material You)
- **Built for:** AI UI builders (v0, Lovable, Bolt, Galileo, etc.)
- **Aesthetic:** "Fresh Sage" — calm, airy minimalism with a vibrant fresh-green accent

## How to use these prompts

1. **Paste Section 0 (Global Design System) first** into your AI UI builder as project/system context.
2. Then paste any **screen prompt (1–11)**. Each assumes the global system is loaded.
3. If you paste a single screen on its own, prepend Section 0 so the style carries over.

---

## 0 · Global Design System (paste this first)

```
You are designing "Process", a beautiful Android habit-tracking app for weight
management. Its philosophy: "Real change happens only by following the process daily."
Build a high-fidelity, production-quality mobile UI using Material 3 (Material You)
and Jetpack Compose conventions. Apply this exact design system to every screen.

BRAND & MOOD
Calm, airy, premium minimalism that still feels vibrant and alive. Lots of
whitespace, soft depth, gentle motion. A serene wellness feel with quiet energy —
encouraging, never aggressive.

COLOR (light theme default)
- Primary / Fresh Green: #21B96B
- Secondary / Teal: #16C2A6
- Signature gradient (rings, primary buttons, key highlights): linear 135deg #2BC56F -> #16C2A6
- Ink (primary text): #23332A
- Muted text: #7C9080
- App background: #F4F8F1
- Surface / cards: #FFFFFF
- Soft sage fill: #EAF3E7
- Streak accent (amber): #E0A33A
- Missed / alert (soft clay): #D9806A
- Track / disabled: #DBEBD6
Also provide a dark variant: background #0F1A14, surfaces #16221B, same green/teal accents.

TYPOGRAPHY
- Headings: "Plus Jakarta Sans", 700–800, tight letter-spacing (-2%).
- Body & UI: "Inter", 400–600.
- Use tabular numerals for all stats/numbers.
- Scale: Display 30 / Headline 22 / Title 16 / Body 14 / Label 11 (uppercase, +14% tracking).

SHAPE & SPACING
8dp spacing grid. Cards 20–24dp radius. Buttons and chips fully rounded (pill).
Generous padding (16–20dp). Soft, low elevation with green-tinted shadows
(e.g. 0 8 24 rgba(40,80,55,0.08)).

COMPONENTS
- Primary button: pill, gradient fill, white text, soft glow.
- Secondary button: tonal sage (#E4F2DE bg, #2C6B3F text), pill.
- Text button: muted.
- Progress ring: thick conic gradient green->teal on a #DBEBD6 track, rounded caps, number centered.
- Habit row: leading tappable circular checkbox (fills green with white check when done),
  rule label with small rounded icon, trailing per-rule streak as a flame + count.
- Cards: white, 20dp radius, soft shadow.
- Calendar heatmap: rounded squares, green intensity by completion %, clay for missed days.
- Line chart: 3px green line, rounded joins, soft green area gradient beneath, dashed teal
  goal line, last point as a ringed dot.
- Bottom navigation: 5 destinations (Today, Meals, Streaks, Weight, Settings) with a center
  camera FAB for quick meal capture; active item green with a soft sage pill background;
  Material Symbols Rounded icons.

ICONOGRAPHY
Material Symbols Rounded, line weight ~2.

MOTION
Gentle spring animations. Progress ring animates its fill on load. Checkboxes bounce
with subtle haptic on tap. Confetti + scale-in on milestones. Page transitions: soft fade + slide.

VOICE / MICROCOPY
Calm, warm, process-focused. Examples: "One day at a time." · "You showed up today." ·
"Don't break the chain." · "Small steps, every day."

ACCESSIBILITY
AA contrast, 48dp minimum tap targets, support dynamic text scaling, never rely on color
alone (always pair with icon or label).

NAVIGATION MODEL
Auth is Google Sign-In on the Welcome screen (the only sign-in method). New users then run onboarding
(Welcome -> Set Days -> Define Rules -> Starting & Goal Weight); returning users skip straight to Today.
Main app uses bottom navigation: Today, Meals, Streaks, Weight, Settings, with a center camera
FAB for quick meal capture. The Daily Check-in opens from the Today screen; capturing a meal
goes Camera -> AI Analysis -> Save. The Milestone celebration is a full-screen overlay triggered on completion.

Output a polished, cohesive Android UI that feels like a deep breath — calm but alive.
```

---

## 1 · Welcome & Philosophy

```
Design the WELCOME / PHILOSOPHY screen — the first thing users see on first launch.
Full-screen, centered, generous vertical rhythm.

- Background: app background #F4F8F1 with a subtle large green->teal radial glow in the
  upper area, plus an optional faint organic leaf/topographic line motif at very low opacity.
- Top: small "Process" wordmark with a minimal leaf/check mark.
- Center hero: the philosophy as a large, beautiful statement in Plus Jakarta Sans, 2–3 lines:
  "Real change happens only by following the process daily."
  Emphasize "the process daily" in the green->teal gradient.
  Below, a calm subline: "Pick your days. Set your rules. Show up every day."
- Three tiny value chips in a row: "Commit", "Your rules", "See change" (with small icons).
- Bottom: a full-width "Continue with Google" button (white surface, Google "G" mark, subtle border —
  follow Google's branding guidelines); Google is the only sign-in method. Tiny legal line beneath:
  "By continuing you agree to our Terms & Privacy."
- New users then enter onboarding (Set Days → Define Rules → Starting & Goal Weight); returning users
  land straight on Today.

Motion: text fades and rises on entry; the gradient glow breathes slowly.
Edge-to-edge, transparent status bar, large bottom safe padding.
This screen should feel serene and inspiring — like taking a deep breath.
```

## 1a · Launch & auth states

```
Design the LAUNCH + AUTH states that pair with the Welcome screen. These are brief states, not a full
screen — Google's account picker itself is a native system dialog and is NOT designed here.

LAUNCH / SESSION CHECK (cold start):
- A calm branded splash on the Fresh Sage background (#F4F8F1): the "Process" wordmark + leaf/check
  mark, centered, with a subtle gradient glow and a gentle breathing animation.
- While it shows, the app checks for an existing session: valid → go straight to Today; none → fade
  into the Welcome screen. Keep it under a second where possible; no spinner unless it actually lags.

SIGNING-IN STATE (after "Continue with Google"):
- The native Google account picker appears (system UI). Once the user picks an account, show an inline
  loading state on the Welcome screen: the "Continue with Google" button becomes a disabled spinner
  with "Signing you in…", the rest of the screen dimmed slightly. This covers backend token
  verification + session creation.
- On success: a gentle transition to onboarding (new user) or Today (returning user).

ERROR STATE:
- If sign-in fails or is cancelled, return to the Welcome screen and show a soft inline message below
  the button in clay (#D9806A), not alarming: "Couldn't sign you in. Please try again." The button
  resets to its normal "Continue with Google" state for retry.

Material 3: circular progress inside or beside the button; inline text (or snackbar) for the error.
Keep everything on-brand — calm and reassuring.
```

## 2 · Set Challenge Length

```
Design the SET CHALLENGE LENGTH onboarding screen (step 1 of 3).

- Top app bar: back arrow + a slim gradient progress bar (1/3 filled) and "Step 1 of 3".
- Heading (Plus Jakarta Sans): "How many days will you commit?"
  Subtext: "Choose a window you'll show up for — every single day."
- Center: a very large chosen number in display size using gradient text (e.g. "75")
  with a "days" label beneath.
- A horizontal row of selectable preset pill chips: 21, 30, 60, 75, 90 (75 preselected,
  gradient fill when active).
- A "Custom" chip that reveals a smooth stepper or wheel (− 75 +); the big number updates live.
- Helper line: "Choose with intention — this sets your whole journey." (calm, not scary).
- Bottom: primary pill button "Continue".

Airy spacing, big gradient number, selected chip uses the gradient. Material 3 FilterChips.
```

## 3 · Define Your Rules

```
Design the DEFINE YOUR RULES onboarding screen (step 2 of 3) — where users build their
daily process.

- Top app bar: back arrow + slim gradient progress (2/3) and "Step 2 of 3".
- Heading: "Set your daily rules"  Subtext: "These are the non-negotiables you'll follow every day."
- A vertical list of rule cards (white, 20dp radius). Each card: a leading rounded icon
  (user-pickable: steps, water, workout, diet, no-sugar, read, sleep…), the rule text
  (e.g. "10,000 steps"), an optional target/unit chip, and swipe-to-delete.
- Pre-seed 2 example rules, plus a prominent dashed "+ Add a rule" tile (tonal sage).
- Tapping add opens a bottom sheet: pick icon, name the rule, optional target (number + unit),
  and frequency (default: every day).
- A small counter: "Your process · 4 rules".
- Encouraging helper: "Most people pick 4–6 rules. Make them specific and doable."
- Bottom: primary "Continue" (disabled until at least 1 rule).

Material 3: bottom sheet for add/edit, drag handle to reorder, swipe-to-delete with undo
snackbar, rounded inputs, pill chips for unit/frequency.
```

## 4 · Starting & Goal Weight

```
Design the STARTING & GOAL WEIGHT onboarding screen (step 3 of 3).

- Top app bar: back arrow + slim gradient progress (near complete) and "Step 3 of 3".
  A small kg/lb segmented toggle on the right.
- Heading: "Where are you starting?"  Subtext: "We'll track your progress — privately, just for you."
- "Current weight": a large tappable number with unit (e.g. 78.6 kg), edited via a beautiful
  horizontal ruler/wheel picker (tick marks in sage, green center indicator).
- "Goal weight": same style below (e.g. 72.0 kg).
- A subtle summary card: a tiny preview of the weight-graph concept with a dashed goal line,
  plus a computed "To lose: 6.6 kg".
- ABOUT YOU section (powers a personalized daily calorie & macro budget for meals, plus BMI):
  sex (segmented), age (compact stepper/wheel), height (ruler picker; ft-in or cm by unit), and
  activity level (pill chips: Sedentary / Light / Moderate / Very active). Keep it compact below
  the weight inputs. Reassuring line: "Used to tailor your daily targets — edit anytime in Settings."
- Bottom: primary "Start my challenge" (gradient, slightly larger — this is the commitment
  moment), with tiny text "You can skip the extras and add them later".

The screen scrolls: weight inputs first (the emotional commitment), then the compact About You group.
Big numbers in gradient/ink. Material 3 horizontal ruler picker + segmented buttons + chips.
```

## 5 · Home / Today  (hero screen)

```
Design the HOME / TODAY screen — the heart of the app (Today tab). Scrollable, edge-to-edge,
app background #F4F8F1.

1. Top bar: left — greeting "Good morning, Sushant" with today's date below; right — a circular
   avatar and/or a small flame streak chip.
2. PHILOSOPHY BANNER pinned near the top: "Real change happens only by following the process
   daily." in a soft sage card, with "the process daily" in the green gradient. Signature,
   present but compact.
3. PROGRESS HERO CARD (white, 24dp): left — a large progress ring (green->teal) showing
   "Day 41 / of 75"; right — stacked stats: "Day streak  fire 41", "Today 3 of 4 done",
   and a thin linear progress for today.
4. TODAY'S PROCESS section (label) -> a card listing habit rows: tappable circular checkbox,
   rule icon + name, trailing per-rule streak (flame + count). Checking animates (bounce +
   today/ring progress updates). Include a primary CTA "Open check-in" linking to the dedicated
   Daily Check-in screen.
5. QUICK WEIGHT ADD card: "Today's weight" with a + button / inline mini input and the last
   delta (e.g. "down 0.3 kg"); tapping routes to the Weight screen.
6. TODAY'S NUTRITION card (compact): a small calorie ring (eaten vs budget) and the daily
   nutrition score chip; tapping routes to the Meals tab.
7. A gentle rotating motivation line near the bottom ("You showed up today.").

Bottom navigation visible (5 tabs: Today active, Meals, Streaks, Weight, Settings) with a center camera FAB.
States: all rules done -> celebratory inline banner "Day complete. See you tomorrow." and the
ring/today progress fill. Motion: ring fills on load, checks bounce.
Material 3: large rounded cards, bottom nav, optional pull-to-refresh.
```

## 6 · Daily Check-in

```
Design the DAILY CHECK-IN screen — a focused, calming flow opened from Home to log today.

- Top app bar: close (x), title "Today · {date}", and a small "Day 41" chip.
- Hero: a friendly headline "How did today go?" (optionally a large today-progress ring).
- Each rule as a large, satisfying toggle card (bigger than Home rows): icon, rule name, target,
  and a big check toggle (fills with gradient when done) — tap gives a bounce + haptic. Support
  three states: done / skipped / missed. Show per-rule streak beneath each:
  "fire 41 day streak — keep it alive".
- A NOTES field at the bottom: "Reflection (optional)" multiline input with a calm placeholder
  ("How are you feeling? What helped today?"). Optional mood selector (3–5 emoji faces).
- Sticky bottom: primary pill "Save today" (gradient).

On save: success animation (check + "Logged. One day at a time."); if all rules done, a small
confetti burst. Material 3: large touch targets, rounded text field, full-screen success state.
```

## 7 · Streaks & Calendar

```
Design the STREAKS & CALENDAR screen (Streaks tab).

- Top: title "Your consistency" + a hero stat row: "Current fire 41", "Longest 52",
  "Perfect days 38" (big numbers in gradient accents).
- A segmented control to switch "By rule" / "Calendar".
- PER-RULE STREAKS: a list of rule cards, each with icon, rule name, current streak (flame +
  count), longest streak, a tiny 7-day mini-tracker (dots/squares), and a subtle progress bar
  to the next milestone.
- CALENDAR HEATMAP: a monthly calendar (or GitHub-style multi-week heatmap) where each day is a
  rounded square colored by % of rules completed (sage -> green intensity; clay for missed;
  outline for upcoming). Month switcher. Tapping a day opens a bottom sheet with that day's
  detail (which rules were done + the note).
- A legend row explaining the color scale.

Empty/early state: an encouraging message for brand-new users. Material 3: cards, segmented
control, bottom sheet for day detail.
```

## 8 · Weight Progress

```
Design the WEIGHT PROGRESS screen (Weight tab).

- Top: title "Weight" + a kg/lb segmented toggle.
- HERO STAT CARD: current weight large (78.6 kg), delta since start ("down 6.4 kg" in green),
  and a "to goal: 0.6 kg" chip, over a subtle gradient background.
- LINE CHART CARD: a beautiful weight-over-time line graph — 3px green line, soft green area
  gradient fill, a dashed teal goal line tagged "Goal 72.0", very faint gridlines, date x-axis,
  highlighted last point, smooth animated draw-in, and tap tooltips (date + weight). Range chips:
  "Week · Month · All".
- STATS GRID: small cards — "Total lost", "Weekly avg", "BMI" (if height set), "Best week"
  (tabular numerals).
- ADD WEIGHT: a primary FAB (or pill) -> bottom sheet with the ruler/wheel picker (defaults to
  last value), date, optional note, "Save". New entry animates onto the graph.
- HISTORY LIST (collapsible): recent entries with date, weight, delta; swipe to edit/delete.

States: not enough data -> "Add a few entries to see your trend." Material 3: FAB, bottom sheet
input, chips for range.
```

## 9 · Milestone / Completion

```
Design the MILESTONE / COMPLETION celebration — a full-screen joyful overlay shown when the user
completes their challenge (Day N) and for streak milestones (7 / 30 / 50 days).

- Full-bleed soft green->teal gradient-tinted background with a confetti animation.
- A large celebratory mark: a glowing progress ring at 100% or a checkmark medal.
- Headline: "You did it." (challenge complete variant: "Day 75. Complete.")
  Subtext: "You followed the process — every single day."
- SUMMARY CARD: journey stats — days completed, perfect days, longest streak, total weight change
  ("down 6.6 kg"), and a tiny sparkline.
- Buttons: primary "Start a new challenge" (gradient), secondary "Share my progress", text
  "Back to home".
- Mid-challenge streak variant: a smaller modal/sheet ("fire 30-day streak! Don't break the chain.")
  with a single "Keep going" button.

Motion: confetti burst, ring/medal scale-in with spring, numbers count up. Tone: proud, warm, earned.
```

## 10 · Settings

```
Design the SETTINGS screen (Settings tab). Title "Settings" with grouped, rounded-card sections:

- PROFILE: name, optional photo, units (kg/lb segmented).
- YOUR CHALLENGE: current summary ("Day 41 of 75"), "Edit rules" (-> rules editor like screen 3),
  "Edit goal weight", "Restart / new challenge" (confirm dialog).
- NUTRITION TARGETS: daily calorie + macro (protein/carbs/fat) budget, auto-suggested from the
  goal weight with a manual override and an "Auto-calculate" toggle.
- REMINDERS: "Daily reminder" toggle + time, linking to the Reminders screen.
- APPEARANCE: theme (System / Light / Dark).
- DATA: export, backup, "Reset all" (destructive, clay color, confirm dialog).
- ABOUT: the philosophy line, version, privacy, rate app.

Each row: leading rounded icon (sage tint), label, trailing control/chevron. Calm, lots of
breathing room. Material 3: list items, green switches, dialogs for destructive actions,
segmented buttons.
```

## 11 · Reminders & Notifications

```
Design the REMINDERS & NOTIFICATIONS screen, plus the notification appearance.

SCREEN:
- Title "Reminders"  Subtext: "A gentle daily nudge to follow your process."
- Master toggle "Daily reminder" (green switch).
- Time picker row: "Remind me at — 8:00 AM" (Material time picker).
- Day selector: chips Mon–Sun (every day default).
- Optional "Evening check-in reminder" with its own time ("Did you close the day?").
- "Streak-at-risk alert" toggle — notify if a rule isn't done by evening.
- A preview card showing how the notification will read.
- A note about Android notification permission with an enable button if not granted.

NOTIFICATION MOCKUPS (show 2–3 as Android heads-up notifications with the Process icon, green accent,
rounded, with quick actions "Mark done" / "Open"):
- Morning: "Process · Day 41 — Time to follow the process. 4 rules today. One day at a time."
- Evening: "Process · You've done 3 of 4. Don't break the chain — finish strong."
- Milestone: "Process · fire 30-day streak! Keep showing up."

Material 3: time picker, switches, chips, notification components.
```

## 12 · Meals / Nutrition Diary

```
Design the MEALS / NUTRITION DIARY screen — a new bottom-nav tab (Meals). Scrollable,
app background #F4F8F1.

- Top: title "Meals" + a horizontal date strip (days of the week; today selected in the green
  gradient). Tapping a day shows that day's log; a small "Today" shortcut.
- DAILY SUMMARY CARD (white, 24dp):
  - A prominent calorie ring (green->teal) showing eaten vs budget — center "1,420 / 2,000 kcal"
    with "580 left".
  - Three macro bars beneath: Protein / Carbs / Fat, each value vs target, color-coded.
  - The DAILY NUTRITION SCORE: a 0–100 number on a red->amber->green band (e.g. 82, green) with a
    one-line verdict ("Balanced day — solid protein.").
- MEALS LIST grouped by section headers: Breakfast, Lunch, Dinner, Snacks. Each meal row: rounded
  photo thumbnail, meal name, calories, a small per-meal score chip (color-coded), and time.
  Empty sections show a faint "+ Add breakfast" prompt.
- A center camera FAB (gradient, elevated, docked in the bottom nav) to capture a new meal.
- Empty state (no meals yet): a warm illustration + "Snap your first meal" + a camera CTA.

States: over budget -> the calorie ring shifts to amber/clay past 100%, gentle (not alarming).
Motion: ring + macro bars animate on load. Material 3: bottom nav with center docked FAB, section
list, chips, color-coded score badges.
```

## 13 · Capture Meal

```
Design the CAPTURE MEAL flow — camera-first, opened from the center FAB.

CAMERA SCREEN:
- Full-bleed camera viewfinder with a subtle rounded framing guide and hint text
  "Fit your whole plate in frame".
- Bottom controls: a gallery thumbnail (pick an existing photo) on the left, a large shutter
  button (gradient ring) in the center, a flash/flip toggle on the right.
- Top: close (x) and a small "Add meal" title.

DETAILS SHEET (slides up over the photo after capture — everything optional):
- The captured photo as a rounded preview at the top, with a "Retake" action.
- Meal type selector: pill chips Breakfast / Lunch / Dinner / Snack (auto-guessed from the time).
- Optional fields: meal name, portion size (e.g. "1 plate"), notes.
- Primary pill button "Analyze with AI"; secondary text button "Save without analysis".

ANALYZING STATE: keep the photo visible with a calm shimmer/scan overlay and "Reading your
plate…" plus a few rotating micro-messages ("Identifying ingredients…", "Estimating portions…").

Material 3: camera UI, bottom sheet with drag handle, chips, rounded inputs. Calm, fast,
low-friction — the whole point is one-tap logging.
```

## 14 · AI Meal Analysis & Detail

```
Design the AI MEAL ANALYSIS & DETAIL screen — the result of analysis, and also the saved-meal
view. Scrollable.

- HERO: the meal photo (rounded, full-width) with the meal name + time over a soft gradient scrim,
  and a per-meal NUTRITION SCORE badge (0–100 on a red->amber->green band, e.g. "84").
- DETECTED ITEMS: an editable list of AI-identified foods, each with an icon, name, portion
  (e.g. "Grilled chicken · 150g") and calories. Each row is tappable to adjust portion, remove, or
  mark wrong; a "+ Add item" row for anything missed. Show a subtle "AI estimate · tap to refine"
  hint and a confidence cue.
- NUTRITION BREAKDOWN card: a calorie total with a small ring, plus Protein / Carbs / Fat bars
  (grams + % of the meal). Tabular numerals.
- SCORE EXPLANATION: one short plain-language reason ("High protein, moderate carbs, low fiber")
  and a single AI TIP in a soft sage callout ("Add a side of greens to boost fiber and your score").
- BUDGET IMPACT: "Adds to today: +540 kcal · 38g protein" with a tiny preview of the updated daily
  calorie ring.
- Sticky bottom: primary "Save to diary" (gradient); secondary "Re-analyze". For an already-saved
  meal these become "Edit" / "Delete".

States: low-confidence detection -> a gentle banner "Not sure about this one — tap items to
correct." Motion: the score badge counts up, bars animate. Material 3: editable list, bottom sheet
for portion edit, soft callout card.
```

---

*Tip: generate the Home / Today screen (5) first — it establishes the visual language; then the
onboarding flow (1–4), then tracking (7–8) and meals (12–14), then the supporting screens
(6, 9, 10, 11).*
