# Authentication — Process

User management via **Better Auth** (self-hosted, TypeScript) with **Google Sign-In as the only
method**. Sessions and users live in **your own Postgres** — no third-party identity provider.

Fits the stack in [tech-stack.md](tech-stack.md) (Expo app + Node/TS API + Postgres).

## Flow (Google idToken — best Android UX)

```
App: native Google account picker        Backend (Better Auth)
─────────────────────────────────        ──────────────────────────────
GoogleSignin.signIn()  ──► idToken
authClient.signIn.social({              POST /api/auth/...
  provider:"google",        ──────────►  verify Google ID token (server-side)
  idToken:{ token }})                     find-or-create user + account rows
                            ◄──────────  create session → token stored in SecureStore
useSession() → signed in                 subsequent API calls carry the session
```

Better Auth supports an **idToken flow** for Google (token obtained natively on the device, verified
on the server). On Android this gives the native one-tap account picker — better than the web-browser
OAuth fallback. (The browser flow is also available and needs no native SDK; use it if you skip the
native module.)

---

## Backend setup (Node/TS API)

Install: `better-auth @better-auth/expo` + your Drizzle/pg deps.

```ts
// auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders: {
    google: {
      // accept ID tokens minted for either platform client (array is allowed)
      clientId: [process.env.GOOGLE_WEB_CLIENT_ID!, process.env.GOOGLE_ANDROID_CLIENT_ID!],
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: ["process://"], // the app's deep-link scheme
  plugins: [expo()],
});
```

Mount the handler (Express/Nest — Better Auth is a standard fetch handler via `toNodeHandler`):

```ts
import { toNodeHandler } from "better-auth/node";
// Mount BEFORE your JSON body parser:
app.all("/api/auth/{*path}", toNodeHandler(auth)); // in NestJS, wire the same via middleware
```

Generate the auth tables (`user`, `session`, `account`, `verification`) for Drizzle:

```bash
npx @better-auth/cli generate     # emits the Drizzle schema
# then: drizzle-kit generate && drizzle-kit migrate
```

Your domain tables (`profiles`, `rules`, `rule_logs`, `weights`, `meals`, …) reference `user.id`.

**API env:** `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `GOOGLE_WEB_CLIENT_ID`,
`GOOGLE_ANDROID_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

---

## App setup (Expo)

Install: `better-auth @better-auth/expo expo-secure-store expo-linking expo-web-browser
expo-constants @react-native-google-signin/google-signin`.

> The native Google module needs a **dev build** (not Expo Go) — use an EAS development build / config plugin.

```ts
// auth-client.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [expoClient({ scheme: "process", storagePrefix: "process", storage: SecureStore })],
});
```

```ts
// sign-in
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { authClient } from "./auth-client";

GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  const idToken = res.data?.idToken;           // newer versions nest under .data
  if (!idToken) throw new Error("No Google ID token");
  await authClient.signIn.social({ provider: "google", idToken: { token: idToken } });
}
```

- `app.json`: `{ "expo": { "scheme": "process" } }`.
- Session: `const { data: session } = authClient.useSession();`
- **Authenticated calls to your own API:** attach the session cookie — `headers: { Cookie: authClient.getCookie() }`. Wire this into your TanStack Query fetcher so every request is authenticated.
- Sign out: `await authClient.signOut();`

**App env:** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

---

## Google Cloud setup

1. **OAuth consent screen** (External), scopes: `email`, `profile`.
2. **Web application** OAuth client → gives `GOOGLE_WEB_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`. The Web
   client ID is also the `webClientId` you pass to `@react-native-google-signin` (it's the audience of
   the ID token Better Auth verifies).
3. **Android** OAuth client → package name + **SHA-1 fingerprint**. Add **both** the debug keystore
   SHA-1 and the **EAS/Play app-signing** SHA-1 (get it via `eas credentials` or Play Console). Without
   the correct SHA-1, native sign-in fails silently.

---

## Onboarding & data model integration

- Store app-specific state in your own **`profiles`** table keyed by `user.id` (e.g.
  `onboarding_completed`, `challenge_days`, the about-you fields for the calorie budget). Keep Better
  Auth's tables for identity only. (Alternatively, Better Auth `additionalFields` can extend `user`.)
- **Routing:** after Google sign-in, if `profiles.onboarding_completed` is false → run onboarding
  (Set Days → Define Rules → Starting & Goal Weight + about-you). Otherwise → land on **Today**.
- The Welcome screen's CTA is **"Continue with Google"** (the only method) — see
  [design-prompts.md](design-prompts.md) screen 1.

---

## Security checklist

- `GOOGLE_CLIENT_SECRET` and `BETTER_AUTH_SECRET` are **server-side only** — never in the app bundle.
- Google ID token is **verified on the server** by Better Auth (don't trust the client).
- Session token is kept in **SecureStore** (encrypted) by the Expo plugin.
- API over **HTTPS**; `trustedOrigins` includes the `process://` scheme.
- Lock the OAuth Android client to your package name + signing SHA-1s.
- Better Auth manages session expiry/refresh — set sensible session/refresh lifetimes in its config.

## iOS later

When you ship iOS, **Apple Sign In is required by the App Store** if you offer a third-party social
login. Add Better Auth's Apple provider (also supports the idToken flow) + an iOS Google client ID.
The Google-only architecture above extends cleanly — it's one more `socialProviders` entry and one more
button.

---

*Better Auth's API evolves — pin versions and confirm against the current
[Expo integration](https://better-auth.com/docs/integrations/expo) and
[Google provider](https://better-auth.com/docs/authentication/google) docs at setup time.*
