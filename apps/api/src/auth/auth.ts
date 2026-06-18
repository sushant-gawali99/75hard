import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { createDb } from '../db/client';

const db = createDb(process.env.DATABASE_URL ?? '');

const webClientId = process.env.GOOGLE_CLIENT_ID;
const androidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Only enable Google when credentials are present, so the app boots without them.
const hasGoogle = !!(webClientId && clientSecret);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  secret: process.env.BETTER_AUTH_SECRET,
  // Falls back to Railway's injected public domain so the URL needn't be set by hand on first deploy.
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'http://localhost:3000'),
  trustedOrigins: ['process://'],
  socialProviders: hasGoogle
    ? {
        google: {
          clientId: [webClientId, androidClientId].filter(Boolean) as string[],
          clientSecret: clientSecret!,
        },
      }
    : {},
  plugins: [expo()],
});

export type Auth = typeof auth;
