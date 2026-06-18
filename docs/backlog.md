# Process — Build Backlog

Every story needed to build **Process** end to end, grouped into epics. Derived from
[design-prompts.md](design-prompts.md), [ai-meal-analysis-spec.md](ai-meal-analysis-spec.md),
[tech-stack.md](tech-stack.md), and [auth.md](auth.md).

**Legend** — Priority: `P0` core MVP · `P1` important · `P2` later/polish. Size: `S` ≤1d · `M` 2–3d ·
`L` 4d+ (split when picked up). Story format: *As a … I want … so that …* + acceptance criteria (AC).

**Recommended sequence (milestones)**
- **M0 Foundation & Auth** — E1 + E2
- **M1 Core loop (MVP)** — Onboarding (days/rules/weight) + Home/Today check-off + streak engine + weight graph
- **M2 Tracking depth** — Streaks screen & calendar, weight stats/history, dedicated check-in
- **M3 Meals & AI** — E8 + nutrition budget + Home nutrition card
- **M4 Engagement** — Reminders, Milestones, Settings
- **M5 Release** — cross-cutting/NFR + Play Store

---

## E1 · Foundation & project setup

**FND-1 · Monorepo scaffold** — *P0 · M*
> As a developer, I want a pnpm + Turborepo monorepo so app, API, and shared code live together.
- AC: `apps/mobile`, `apps/api`, `packages/shared`; `pnpm install` + `turbo` run; shared import works both sides.

**FND-2 · Expo app skeleton + navigation** — *P0 · M*
> As a developer, I want the Expo app with Expo Router so screens have a navigation shell.
- AC: bottom tabs (Today/Meals/Streaks/Weight/Settings); onboarding stack; modal routes (check-in, capture, analysis); runs on Android dev build. Deps: FND-1.

**FND-3 · NestJS API skeleton** — *P0 · S*
> As a developer, I want a NestJS API with config + env validation and a health route.
- AC: `/health` returns ok; env schema validated on boot; structured logging (pino). Deps: FND-1.

**FND-4 · Postgres + Drizzle** — *P0 · M*
> As a developer, I want Postgres with Drizzle migrations.
- AC: DB connection from env; drizzle-kit generate/migrate wired; one sample migration applies. Deps: FND-3.

**FND-5 · Shared zod schemas & types** — *P0 · S*
> As a developer, I want shared zod schemas/DTOs in `packages/shared`.
- AC: API request/response DTOs + enums defined once; imported by app and API. Deps: FND-1.

**FND-6 · Design tokens, theme & fonts** — *P0 · M*
> As a developer, I want the Fresh Sage design system in code.
- AC: color tokens + type scale; Plus Jakarta Sans + Inter via expo-font; light theme provider. Deps: FND-2.

**FND-7 · Base UI component library** — *P0 · L*
> As a developer, I want reusable themed components so screens are consistent.
- AC: Button (pill/gradient/tonal/text), Card, Chip, ProgressRing (gradient), HabitRow, SectionLabel, BottomNav, inputs — all themed to tokens. Deps: FND-6.

**FND-8 · API client + TanStack Query** — *P0 · M*
> As a developer, I want a typed API client with auth + caching.
- AC: fetcher attaches the auth session cookie; TanStack Query configured; typed via shared DTOs; error normalization. Deps: FND-5, AUTH-6.

**FND-9 · Local persistence (MMKV)** — *P1 · S*
> As a user, I want the app to feel instant offline.
- AC: MMKV installed; TanStack Query cache persisted/restored. Deps: FND-8.

**FND-10 · CI pipeline** — *P1 · S*
> As a developer, I want CI to catch breakage.
- AC: GitHub Actions runs typecheck + lint + tests on PR. Deps: FND-1.

**FND-11 · EAS build profiles** — *P1 · M*
> As a developer, I want EAS dev/preview/prod builds.
- AC: dev client builds (needed for native Google sign-in); preview + prod profiles defined. Deps: FND-2.

**FND-12 · Shared loading/error/empty states** — *P1 · S*
> As a user, I want consistent loading/empty/error UI.
- AC: reusable Spinner, ErrorState, EmptyState components on-brand. Deps: FND-7.

**FND-13 · Sentry monitoring** — *P2 · S*
> As a developer, I want crash/error reporting.
- AC: Sentry wired in app + API; a test error reports. Deps: FND-3, FND-2.

---

## E2 · Authentication (Google · Better Auth)

**AUTH-1 · Better Auth server setup** — *P0 · M*
> As a developer, I want Better Auth running with Drizzle + the Expo plugin.
- AC: `auth` configured with drizzleAdapter + `expo()`; handler mounted at `/api/auth/*`; generated `user/session/account/verification` tables migrated. Deps: FND-4.

**AUTH-2 · Google Cloud OAuth config** — *P0 · S*
> As a developer, I want Google OAuth clients set up.
- AC: consent screen; Web client (id+secret); Android client with debug + EAS/Play SHA-1. Deps: —.

**AUTH-3 · Google provider + idToken verification** — *P0 · M*
> As a user, I want my Google identity verified server-side.
- AC: `socialProviders.google` accepts the platform client IDs; ID token verified; find-or-create user+account. Deps: AUTH-1, AUTH-2.

**AUTH-4 · Expo native Google sign-in** — *P0 · M*
> As a user, I want the native Google account picker.
- AC: `@react-native-google-signin` configured (webClientId); returns idToken; `authClient.signIn.social` creates a session stored in SecureStore. Deps: AUTH-3, FND-11.

**AUTH-5 · "Continue with Google" on Welcome** — *P0 · M*
> As a new user, I want to sign in from the Welcome screen.
- AC: button triggers AUTH-4; success routes onward; matches design (screen 1). Deps: AUTH-4, ONB-1.

**AUTH-6 · Session-authenticated API + guard** — *P0 · M*
> As a user, I want my data protected.
- AC: API requests carry the session; an auth guard rejects unauthenticated calls (401); `req.user` available. Deps: AUTH-1.

**AUTH-7 · Launch session check + routing** — *P0 · S*
> As a returning user, I want to skip sign-in.
- AC: branded splash checks session → Today if valid, Welcome if not (screen 1a). Deps: AUTH-4.

**AUTH-8 · Signing-in & error states** — *P1 · S*
> As a user, I want feedback during/after sign-in.
- AC: button shows "Signing you in…" spinner; failure/cancel shows clay inline retry message (screen 1a). Deps: AUTH-5.

**AUTH-9 · Profiles table + first-login bootstrap** — *P0 · S*
> As a developer, I want app state separate from identity.
- AC: `profiles` row created on first login (onboarding_completed=false, demographics, challenge fields) keyed by user.id. Deps: AUTH-3.

**AUTH-10 · Sign out** — *P1 · S*
> As a user, I want to sign out.
- AC: clears session + SecureStore; routes to Welcome. Deps: AUTH-4.

---

## E3 · Onboarding

**ONB-1 · Welcome & Philosophy screen** — *P0 · M*
> As a new user, I want an inspiring intro.
- AC: philosophy hero, value chips, gradient glow/animation per screen 1. Deps: FND-7.

**ONB-2 · Set Challenge Length** — *P0 · M*
> As a user, I want to choose how many days I commit.
- AC: preset chips (21/30/60/75/90) + custom; big gradient number; persists to profile. Deps: ONB-1.

**ONB-3 · Define Your Rules (add/edit)** — *P0 · L*
> As a user, I want to set my daily rules.
- AC: rule list; add/edit bottom sheet (icon, name, optional target+unit, frequency=daily default); ≥1 required to continue; persists. Deps: ONB-2.

**ONB-4 · Rules reorder + swipe-delete** — *P1 · M*
> As a user, I want to reorder/remove rules.
- AC: drag-handle reorder; swipe-delete with undo snackbar. Deps: ONB-3.

**ONB-5 · Starting & Goal Weight** — *P0 · M*
> As a user, I want to set my baseline and target.
- AC: kg/lb toggle; ruler picker for current + goal; "to lose" computed; persists. Deps: ONB-3.

**ONB-6 · About You (budget inputs)** — *P0 · M*
> As a user, I want a personalized calorie/macro budget.
- AC: sex, age, height, activity captured; reassurance copy; persists to profile. Deps: ONB-5.

**ONB-7 · Persist onboarding + route to Today** — *P0 · S*
> As a user, I want my setup saved and to start.
- AC: "Start my challenge" sets onboarding_completed=true, creates challenge + rules; routes to Today. Deps: ONB-6, HOME-1.

**ONB-8 · Nutrition budget derivation** — *P1 · M*
> As the system, I want daily calorie/macro targets from the user's data.
- AC: Mifflin-St Jeor → TDEE (activity) → deficit; macro split; stored in nutrition_targets; floors applied. Deps: ONB-6.

---

## E4 · Home / Today

**HOME-1 · Today screen + bottom nav** — *P0 · M*
> As a user, I want a daily hub.
- AC: scrollable Today screen, Today tab active, greeting + date. Deps: FND-7.

**HOME-2 · Philosophy banner** — *P0 · S*
> As a user, I want the philosophy present daily.
- AC: pinned banner with gradient emphasis. Deps: HOME-1.

**HOME-3 · Progress hero (ring + streak)** — *P0 · M*
> As a user, I want to see my day/streak progress.
- AC: ring shows Day X of N; streak count; today progress. Deps: HOME-1, STRK-1.

**HOME-4 · Today's rules inline check-off** — *P0 · L*
> As a user, I want to tick rules done today.
- AC: tappable circular checkbox with bounce; optimistic update; ring/today progress updates; persists via HOME-9. Deps: HOME-9.

**HOME-5 · Per-rule streak display** — *P0 · S*
> As a user, I want each rule's streak.
- AC: flame + count per rule row. Deps: STRK-1.

**HOME-6 · Quick weight add card** — *P1 · S*
> As a user, I want to log weight fast.
- AC: card shows last delta; + opens weight entry / routes to Weight. Deps: WGT-1.

**HOME-7 · Today's nutrition card** — *P1 · S*
> As a user, I want a glance at today's nutrition.
- AC: mini calorie ring + daily score; routes to Meals. Deps: MEAL-7, MEAL-13.

**HOME-8 · Motivation line + day-complete banner** — *P2 · S*
> As a user, I want encouragement.
- AC: rotating microcopy; "Day complete" banner when all rules done. Deps: HOME-4.

**HOME-9 · Rule-log model + API** — *P0 · M*
> As the system, I want to record daily rule completion.
- AC: `rule_logs` (rule_id, date, state); mark/unmark endpoints; idempotent per day. Deps: ONB-3, AUTH-6.

---

## E5 · Daily Check-in

**CHK-1 · Check-in screen** — *P1 · M*
> As a user, I want a focused place to log today.
- AC: opens from Home; date + Day chip; large rule toggle cards. Deps: HOME-9.

**CHK-2 · 3-state toggles** — *P1 · M*
> As a user, I want done/skipped/missed states.
- AC: tri-state per rule with haptic; persists distinct states. Deps: CHK-1, HOME-9.

**CHK-3 · Notes + mood** — *P1 · S*
> As a user, I want to reflect.
- AC: optional multiline note + mood emoji; stored per day. Deps: CHK-1.

**CHK-4 · Save + success** — *P1 · S*
> As a user, I want satisfying confirmation.
- AC: "Save today" → success animation; confetti when all done. Deps: CHK-2.

---

## E6 · Streaks & Calendar

**STRK-1 · Streak engine** — *P0 · M*
> As the system, I want streaks computed reliably.
- AC: per-rule current + longest; perfect-days; handles gaps/timezones; unit-tested. Deps: HOME-9.

**STRK-2 · Streaks screen** — *P1 · M*
> As a user, I want to see my consistency.
- AC: hero stats (current/longest/perfect); per-rule cards with mini 7-day tracker. Deps: STRK-1.

**STRK-3 · Calendar heatmap** — *P1 · L*
> As a user, I want a calendar of consistency.
- AC: month grid colored by % rules done; clay for missed; month switcher. Deps: STRK-1.

**STRK-4 · Day detail sheet** — *P1 · S*
> As a user, I want a day's breakdown.
- AC: tapping a day opens sheet with that day's rules + note. Deps: STRK-3.

**STRK-5 · Segmented control + legend** — *P2 · S*
> As a user, I want to switch views.
- AC: "By rule"/"Calendar" toggle; color legend. Deps: STRK-2, STRK-3.

---

## E7 · Weight Progress

**WGT-1 · Weight entry** — *P0 · M*
> As a user, I want to add my weight.
- AC: ruler/wheel sheet (defaults to last), date, optional note; saves via WGT-2. Deps: WGT-2.

**WGT-2 · Weight model + endpoints** — *P0 · S*
> As the system, I want to store weights.
- AC: `weights` (user, date, value, note); create/list/edit/delete endpoints. Deps: AUTH-6.

**WGT-3 · Weight line graph** — *P0 · L*
> As a user, I want to see my trend.
- AC: green line + soft fill, dashed goal line, range chips (week/month/all), animated draw, tap tooltips. Deps: WGT-2.

**WGT-4 · Hero stat card** — *P1 · S*
> As a user, I want my key number.
- AC: current weight, delta since start, to-goal chip. Deps: WGT-2.

**WGT-5 · Stats grid** — *P1 · M*
> As a user, I want richer stats.
- AC: total lost, weekly avg, BMI (if height). Deps: WGT-2, ONB-6.

**WGT-6 · History list + edit/delete** — *P1 · M*
> As a user, I want to manage entries.
- AC: recent list with delta; swipe edit/delete. Deps: WGT-2.

**WGT-7 · Empty/early state** — *P2 · S*
> As a new user, I want guidance.
- AC: friendly "add a few entries" state. Deps: WGT-3.

---

## E8 · Meals & AI Nutrition

**MEAL-1 · Object storage + presigned upload** — *P1 · M*
> As the system, I want photos stored cheaply and securely.
- AC: R2/S3 bucket; presigned upload from app; object key on meal; signed read URLs. Deps: FND-3.

**MEAL-2 · Camera capture + downscale** — *P1 · M*
> As a user, I want to snap my meal.
- AC: expo-camera viewfinder + gallery pick; downscale to ~1024–1568px before upload. Deps: FND-2, MEAL-1.

**MEAL-3 · Capture details sheet** — *P1 · S*
> As a user, I want to add optional context.
- AC: meal type (auto-guessed) + name/portion/notes; all optional. Deps: MEAL-2.

**MEAL-4 · Claude vision identification** — *P1 · L*
> As the system, I want foods + portions from the photo.
- AC: `messages.parse` with MealVision schema; handles not-food; system prompt cached. Deps: FND-3.

**MEAL-5 · FatSecret client** — *P1 · L*
> As the system, I want authoritative nutrition.
- AC: OAuth2 token cached; `foods.search` → `food.get.v5`; scale to grams; static egress IP documented. Deps: FND-3.

**MEAL-6 · Nutrition resolution + cache** — *P1 · M*
> As the system, I want aggregated meal nutrients.
- AC: per-item resolve + aggregate totals; cache food.get by food_id; Claude-estimate fallback on miss. Deps: MEAL-4, MEAL-5.

**MEAL-7 · Scoring module** — *P1 · M*
> As the system, I want a 0–100 score.
- AC: weighted deterministic meal score + band + rationale; daily roll-up; config-driven; unit-tested. Deps: MEAL-6, ONB-8.

**MEAL-8 · Tip generation** — *P1 · S*
> As a user, I want a friendly tip.
- AC: Haiku call returns rationale + one-line tip from final numbers. Deps: MEAL-7.

**MEAL-9 · /meals/analyze endpoint** — *P1 · M*
> As the app, I want one call to analyze a meal.
- AC: orchestrates MEAL-4→8; returns items+nutrients+score+tip+budget impact (draft, unsaved). Deps: MEAL-4..8.

**MEAL-10 · Analyzing state UI** — *P1 · S*
> As a user, I want calm feedback while it works.
- AC: shimmer/scan overlay + rotating messages. Deps: MEAL-9.

**MEAL-11 · Analysis & detail screen** — *P1 · L*
> As a user, I want to review and fix the analysis.
- AC: photo + score badge; editable items (portion/remove/add); macro breakdown; rationale + tip; budget impact; save/re-analyze. Deps: MEAL-9.

**MEAL-12 · Re-analyze on edit** — *P1 · M*
> As a user, I want numbers to update when I edit items.
- AC: edits re-run resolution+scoring+tip (skip vision). Deps: MEAL-11, MEAL-6.

**MEAL-13 · Save meal + model** — *P1 · M*
> As a user, I want my meal logged.
- AC: `meals` + `meal_items`; save persists draft; appears in diary. Deps: MEAL-9.

**MEAL-14 · Meals diary screen** — *P1 · L*
> As a user, I want my day's meals + nutrition.
- AC: date strip; daily summary (calorie ring vs budget, macro bars, daily score); meals grouped by type; camera FAB; empty state. Deps: MEAL-13, MEAL-7.

**MEAL-15 · Edge-case handling** — *P1 · S*
> As a user, I want graceful failures.
- AC: not-food message; low-confidence banner; FatSecret-miss fallback surfaced. Deps: MEAL-9.

**MEAL-16 · Nutrition targets in Settings** — *P1 · S*
> As a user, I want to adjust my budget.
- AC: read/override targets; auto-calc toggle. Deps: ONB-8, SET-1.

**MEAL-17 · Analyze rate limit** — *P2 · S*
> As the system, I want to bound AI cost/abuse.
- AC: per-user rate limit on /meals/analyze. Deps: MEAL-9.

---

## E9 · Reminders & Notifications

**NOTIF-1 · Notifications setup + permissions** — *P1 · S*
> As a user, I want to allow reminders.
- AC: expo-notifications configured; Android permission flow handled. Deps: FND-2.

**NOTIF-2 · Reminders settings screen** — *P1 · M*
> As a user, I want to control reminders.
- AC: master toggle, time, day chips; persisted; preview card. Deps: NOTIF-1.

**NOTIF-3 · Daily reminder scheduling** — *P1 · M*
> As a user, I want a daily nudge.
- AC: local notification scheduled at chosen time/days; reschedules on change. Deps: NOTIF-2.

**NOTIF-4 · Evening check-in reminder** — *P2 · S*
> As a user, I want an end-of-day nudge.
- AC: optional second scheduled reminder. Deps: NOTIF-3.

**NOTIF-5 · Streak-at-risk alert** — *P2 · M*
> As a user, I want to be warned before breaking a streak.
- AC: notify in the evening if a rule isn't done yet. Deps: NOTIF-3, HOME-9.

**NOTIF-6 · Notification copy/preview** — *P2 · S*
> As a user, I want to see how reminders read.
- AC: preview matches scheduled content; on-brand copy. Deps: NOTIF-2.

---

## E10 · Milestone / Completion

**MILE-1 · Streak milestone modal** — *P2 · M*
> As a user, I want to celebrate streak milestones.
- AC: modal at 7/30/50-day streaks with confetti + "Keep going". Deps: STRK-1.

**MILE-2 · Challenge completion screen** — *P1 · M*
> As a user, I want a payoff at Day N.
- AC: full-screen celebration; journey summary stats; confetti + count-up. Deps: STRK-1, WGT-2.

**MILE-3 · Share progress** — *P2 · M*
> As a user, I want to share my result.
- AC: shareable summary image/text. Deps: MILE-2.

**MILE-4 · Start new challenge** — *P1 · S*
> As a user, I want to begin again.
- AC: resets/creates a new challenge from completion (or Settings). Deps: ONB-2.

---

## E11 · Settings

**SET-1 · Settings screen** — *P1 · M*
> As a user, I want a settings hub.
- AC: grouped rounded-card sections; rows with icon + control. Deps: FND-7.

**SET-2 · Profile** — *P1 · S*
> As a user, I want to manage my profile.
- AC: name, optional photo, kg/lb units. Deps: SET-1.

**SET-3 · Edit rules / goal weight** — *P1 · M*
> As a user, I want to change my plan.
- AC: reuse rules editor; edit goal weight. Deps: SET-1, ONB-3.

**SET-4 · Nutrition targets editor** — *P1 · S*
> (delivered with MEAL-16)
- AC: see MEAL-16. Deps: MEAL-16.

**SET-5 · Reminders link** — *P1 · S*
> As a user, I want to reach reminder settings.
- AC: row navigates to NOTIF-2. Deps: SET-1, NOTIF-2.

**SET-6 · Appearance (theme)** — *P2 · M*
> As a user, I want light/dark/system.
- AC: theme switch persists + applies. Deps: QA-3.

**SET-7 · Data export + reset** — *P2 · M*
> As a user, I want control over my data.
- AC: export; "reset all" + "restart challenge" with confirm dialogs (clay). Deps: SET-1.

**SET-8 · About** — *P2 · S*
> As a user, I want app info.
- AC: philosophy line, version, privacy link, rate app. Deps: SET-1.

---

## E12 · Cross-cutting & release (NFR)

**QA-1 · Offline resilience** — *P2 · M*
> As a user, I want the app usable offline.
- AC: optimistic writes queue + sync on reconnect for check-offs/weights. Deps: FND-9.

**QA-2 · Accessibility pass** — *P1 · M*
> As any user, I want an accessible app.
- AC: AA contrast, 48dp targets, dynamic text scaling, labels; never color-only. Deps: FND-7.

**QA-3 · Dark theme** — *P2 · M*
> As a user, I want a dark mode.
- AC: Fresh Sage dark variant across screens. Deps: FND-6.

**QA-4 · App icon + splash** — *P1 · S*
> As a user, I want polished branding.
- AC: icon + adaptive icon + splash on-brand. Deps: FND-6.

**QA-5 · Privacy policy + photo disclosure** — *P1 · S*
> As a user, I want transparency.
- AC: privacy policy; meal photos processed by Claude disclosed; in-app + store. Deps: —.

**QA-6 · Security review** — *P1 · M*
> As the owner, I want the app secure.
- AC: keys server-side only; FatSecret static egress IP; signed photo URLs; auth on all routes; rate limits. Deps: MEAL-1, MEAL-5, AUTH-6.

**QA-7 · Performance pass** — *P2 · M*
> As a user, I want a smooth app.
- AC: list virtualization, image caching, 60fps animations, cold-start budget. Deps: —.

**QA-8 · Analytics/events** — *P2 · S*
> As the owner, I want product insight.
- AC: key events tracked (sign-in, check-off, meal logged) privacy-respecting. Deps: FND-13.

**QA-9 · Play Store release** — *P1 · M*
> As the owner, I want to ship to Android.
- AC: EAS prod build + submit; store listing, screenshots, data-safety form. Deps: FND-11, QA-4, QA-5.

**QA-10 · E2E happy-path tests** — *P2 · M*
> As a developer, I want confidence in core flows.
- AC: Maestro flows: sign-in → onboard → check-off → log weight → log meal. Deps: M3 done.

---

*~95 stories across 12 epics. Priorities mark a sensible MVP (M0–M1); meals/AI (M3) is the flagship
add-on after the core loop works. Refine sizes/splits as you pick stories up.*
