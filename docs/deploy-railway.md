# Deploying Process on Railway

Railway hosts the **NestJS API + Postgres**. The Expo mobile app is **not** deployed to
Railway — it's built into an APK that points `EXPO_PUBLIC_API_URL` at the deployed API URL.

The repo is already deploy-ready:

- **`Dockerfile`** (repo root) — builds `@process/shared` + `@process/api` from the pnpm/turbo
  monorepo (the Expo app is excluded). Verified to build and boot locally.
- **`railway.json`** — tells Railway to use the Dockerfile, run DB migrations as a
  `preDeployCommand`, then serve. Health check hits `/health`.
- **`apps/api/src/migrate.ts`** — production migrator (uses `drizzle-orm`, not the dev-only
  `drizzle-kit`); applies everything in `apps/api/drizzle/`.

---

## 1. Create the project + database

**Dashboard:** [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo**
→ pick `sushant-gawali99/75hard`, branch `main`. Then **New → Database → PostgreSQL**.

**CLI** (alternative):
```bash
npm i -g @railway/cli
railway login
railway init                 # create/link a project
railway add --database postgres
```

## 2. Set environment variables on the API service

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` ← Railway reference to the Postgres service (internal, no SSL needed) |
| `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | optional — auto-derives from `RAILWAY_PUBLIC_DOMAIN`. Set explicitly only if you use a custom domain. |
| `ANTHROPIC_API_KEY` | your Anthropic key (meal photo analysis) |
| `FATSECRET_CLIENT_ID` / `FATSECRET_CLIENT_SECRET` | optional (see note below) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional — only when enabling Google sign-in |

`NODE_ENV=production` is baked into the image. `PORT` is provided by Railway automatically.

CLI form:
```bash
railway variables \
  --set "DATABASE_URL=${{Postgres.DATABASE_URL}}" \
  --set "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" \
  --set "ANTHROPIC_API_KEY=sk-ant-..."
```

## 3. Expose + deploy

- **Settings → Networking → Generate Domain** to get `https://<name>.up.railway.app`.
- Deploy: a GitHub-connected service builds on every push to `main`; or run `railway up`
  to deploy the local working tree.
- On deploy, Railway runs `migrate.js` (preDeployCommand) → then starts the server. Watch
  the deploy logs for `[migrate] done` and `Process API listening on port …`.
- Verify: `curl https://<name>.up.railway.app/health`.

## 4. Point the mobile app at the deployed API

In `apps/mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://<name>.up.railway.app
```
Then rebuild the app (`expo prebuild -p android` + a debug/release build). For local
device testing against Railway you don't even need the local API or Docker Postgres.

---

## Notes / gotchas

- **FatSecret IP whitelist:** FatSecret requires whitelisting your server's outbound IP.
  Railway egress IPs are dynamic by default, so FatSecret calls will likely fail there — the
  meal pipeline already **falls back to Claude estimates**, so analysis still works, just
  without FatSecret's database. Use Railway static egress (paid) or a proxy if you need it.
- **Migrations** are idempotent (drizzle tracks applied files), so they're safe to run on
  every deploy. They run as a `preDeployCommand`, before the new version takes traffic.
- **SSL:** using the `${{Postgres.DATABASE_URL}}` reference connects over Railway's private
  network (no SSL). If you ever use the *public* Postgres proxy URL, append `?sslmode=require`
  and add `ssl` to the `pg` Pool in `apps/api/src/db/client.ts`.
- **Single instance** is assumed for migrations. If you scale to multiple replicas, keep the
  migration step as a one-shot pre-deploy (it already is) rather than in the start command.
```
