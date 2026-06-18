# Tech Stack — Process

An end-to-end **TypeScript** stack: a React Native (Expo) app, a Node/TS API, and PostgreSQL,
with shared types across both. Chosen to match your build approach (Expo), backend preference
(Node/TS + Postgres), and comfort (TypeScript).

Implements the design in [design-prompts.md](design-prompts.md) and the AI pipeline in
[ai-meal-analysis-spec.md](ai-meal-analysis-spec.md).

## Architecture

```
┌─────────────────────────┐        HTTPS / JWT        ┌──────────────────────────┐
│  Expo app (React Native)│ ────────────────────────► │  Node/TS API (NestJS)    │
│  Android (iOS-ready)    │ ◄──────────────────────── │                          │
└─────────────────────────┘                           │  ├─ Postgres (Drizzle)   │
        │                                              │  ├─ Redis (cache/limits) │
        │ meal photo (presigned upload)                │  ├─ Anthropic SDK (Claude)│
        ▼                                              │  └─ FatSecret client     │
   Object storage (R2/S3) ◄──────────────────────────── (static egress IP) ─────►  FatSecret API
                                                          └────────────────────►   Claude API
        packages/shared  ──  zod schemas & types shared by app + API
```

---

## Mobile app — Expo (React Native)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Expo (managed) + React Native** | One codebase, Android now / iOS later. |
| Navigation | **Expo Router** | File-based: tab navigator (Today/Meals/Streaks/Weight/Settings) + onboarding stack + modal routes (check-in, capture, analysis). |
| UI components | **React Native Paper (Material 3)** + custom themed components | MD3 primitives (buttons, FAB, chips, switches, bottom nav) themed to Fresh Sage; build custom for the ring, charts, calendar heatmap. |
| Styling/theme | Central **design tokens** file (Fresh Sage palette, type scale) | Optionally **NativeWind** (Tailwind for RN) for utility styling. |
| Fonts | **expo-font** | Plus Jakarta Sans (headings) + Inter (body) from the design system. |
| Graphics & animation | **@shopify/react-native-skia** + **react-native-reanimated** (+ **Moti**) | Skia for the gradient progress ring and smooth fills; Reanimated/Moti for gentle springs, check bounce, confetti on milestones. |
| Charts | **react-native-gifted-charts** (or **victory-native** XL) | Weight line graph with gradient fill + dashed goal line; calendar heatmap via `react-native-svg`. |
| Camera & images | **expo-camera**, **expo-image-picker**, **expo-image-manipulator** | Capture/pick meal photos; **downscale to ~1024–1568 px before upload** (matches the AI spec's cost note). |
| Server state | **TanStack Query** | Caching, optimistic check-offs, retries; persist cache (with MMKV) for offline resilience. |
| Local state | **Zustand** | Light UI/session state. |
| Offline / local data | **react-native-mmkv** (fast KV) | For query persistence + small local state. Add **expo-sqlite + Drizzle** if you want full offline-first habit logging. |
| Forms & validation | **react-hook-form + zod** | Reuse zod schemas from `packages/shared`. |
| Reminders | **expo-notifications** | Local scheduled notifications cover the daily/evening nudges (screen 11) with no push server. Add Expo Push later for server-driven alerts. |
| Secure storage | **expo-secure-store** | Store JWT access/refresh tokens. |
| Builds & OTA | **EAS Build / Submit / Update** | CI builds, Play Store submission, over-the-air JS updates. |

**Note on the AI-builder prompts:** v0/Lovable/Bolt output **web React**, not React Native. Use the
prompts as **design references** and as a fast way to prototype look-and-feel on web; rebuild the
screens with RN components (Paper + custom). The design tokens and layouts carry over directly.

---

## Backend — Node/TS API

| Concern | Choice | Notes |
|---|---|---|
| Runtime + language | **Node.js (LTS) + TypeScript** | |
| Framework | **NestJS** | Structured, opinionated, excellent TS DX. Lighter alternatives: **Fastify** or **Express**. |
| ORM | **Drizzle ORM** | TS-first, lightweight, SQL-ish. Alternative: **Prisma**. |
| Database | **PostgreSQL** (managed) | Tables per the AI spec: `meals`, `meal_items`, `nutrition_targets`, plus habit `rules`, `rule_logs`, `weights`, `users`. |
| Auth | **Better Auth** (self-hosted) — **Google Sign-In only** | Google social provider via the **idToken flow** (native Android account picker) + Drizzle/Postgres adapter + `@better-auth/expo`. Users & sessions in your own DB. See [auth.md](auth.md). |
| Cache / rate limit | **Redis (Upstash)** | Cache the FatSecret OAuth token + `food.get` results by `food_id`; per-user rate limit on `/meals/analyze`. (A Postgres cache table works too.) |
| Validation | **zod** (shared) | Same schemas validate API I/O and Claude's structured output. |
| AI | **@anthropic-ai/sdk** | `messages.parse()` + zod for vision identification and the tip call. |
| FatSecret | small typed client | OAuth2 client-credentials (cache token); `foods.search` → `food.get.v5`; cache by `food_id`. |
| Nutrition scoring | pure TS module | Deterministic 0–100 score + budget math from the AI spec — no external calls, fully testable. |
| Logging | **pino** | Structured logs. |

---

## Storage & integrations

| Concern | Choice | Notes |
|---|---|---|
| Meal photos | **Cloudflare R2** (or S3) | S3-compatible, cheap, no egress fees. Upload via **presigned URLs** straight from the app; store the object key on the `meals` row; serve via signed URLs. |
| Claude API | server-side key only | Vision + tip calls run on the backend (never ship the key in the app). |
| FatSecret API | server-side, **static egress IP** | See hosting note below. |

---

## Hosting & infra

| Layer | Recommendation | Why |
|---|---|---|
| API | **Render / Railway / Fly.io** (container) **or** a small VPS (Hetzner/DigitalOcean) | **FatSecret requires IP allowlisting**, so the API needs a *stable outbound IP*. **Avoid pure serverless** (Vercel/Lambda rotate IPs) for the FatSecret calls — or route just those through a fixed-IP proxy. This is the single most important infra constraint. |
| Postgres | **Neon** / **Railway** / **RDS** | Managed Postgres; Neon has nice branching for dev. |
| Redis | **Upstash** | Serverless Redis for token/food cache + rate limits. |
| Object storage | **Cloudflare R2** | Cheap, S3 API. |
| Mobile distribution | **EAS** → Google Play | EAS Build/Submit; EAS Update for OTA. |
| Error monitoring | **Sentry** (RN + Node) | Crash + error tracking both sides. |

---

## Monorepo & shared code

Because app and backend are both TypeScript, use a monorepo so types and schemas are shared once.

```
process/
├─ apps/
│  ├─ mobile/        # Expo app
│  └─ api/           # NestJS backend
├─ packages/
│  └─ shared/        # zod schemas (meal analysis, API DTOs), shared types, scoring rubric constants
├─ package.json      # pnpm workspaces
└─ turbo.json        # Turborepo pipeline
```

- **pnpm workspaces + Turborepo** — fast installs, cached builds, one command to run app + api.
- `packages/shared` holds the zod schemas (e.g. `MealVision`, `Tip`, API request/response DTOs) and the
  scoring/budget constants — imported by both the app and the API. One source of truth, no drift.

---

## Dev tooling, testing, CI

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Lint/format | **Biome** (fast, all-in-one) or ESLint + Prettier |
| Tests | **Vitest** (units: scoring, FatSecret client, API) + **Maestro** or RN Testing Library (app flows) |
| API contract | zod-derived types shared via `packages/shared` |
| CI | **GitHub Actions** — typecheck, lint, test, EAS build on tag |

---

## Why this stack (one-liner each)

- **Expo** — ship to Android fast, iOS later, OTA updates, huge ecosystem; matches your build choice.
- **NestJS + Drizzle + Postgres** — structured, type-safe TS backend with a relational model that fits
  habits/streaks/meals/weights cleanly.
- **One language end-to-end** — share zod schemas and the meal-analysis types across app and API; less glue.
- **R2 + presigned uploads** — keep large photo uploads off your API and cheap to store.
- **Stable-IP host** — the one non-obvious requirement, driven by FatSecret's allowlist.

## Suggested first milestones

1. **Monorepo skeleton** — pnpm + Turborepo, `apps/mobile` (Expo + Expo Router tabs), `apps/api` (NestJS), `packages/shared`.
2. **Auth + Home/Today** — sign-in, then the hero screen with rules check-off (optimistic) backed by Postgres.
3. **Weight tracking** — entry + graph (gifted-charts) + goal line.
4. **Meals** — camera → presigned R2 upload → `/meals/analyze` (Claude + FatSecret + scorer) → result screen.
5. **Reminders + Settings** — local notifications, nutrition-target editing.

---

*Library choices reflect the React Native / Node ecosystem as of mid-2026 — pin versions at setup time.*
