# syntax=docker/dockerfile:1
# Process API — built from the pnpm + turbo monorepo. Docker build context = repo root.
FROM node:22-slim

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# --- deps (cached on manifest changes) ---
# All workspace manifests are copied so the lockfile resolves, but only the
# api + shared projects are installed (the Expo mobile app is excluded).
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/
RUN pnpm install --frozen-lockfile --filter @process/shared --filter @process/api

# --- build (shared first, then the api) ---
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
RUN pnpm --filter @process/shared build \
 && pnpm --filter @process/api build

# Runtime defaults. NODE_ENV is set AFTER install so dev deps (nest-cli, tsc) were available to build.
ENV NODE_ENV=production
EXPOSE 3000

# Migrations run via Railway's preDeployCommand (see railway.json); this just serves.
CMD ["node", "/app/apps/api/dist/main.js"]
