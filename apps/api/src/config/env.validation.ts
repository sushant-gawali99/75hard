import { z } from 'zod';

/** Environment schema — validated at boot so misconfig fails fast and loud. */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().optional(),
  // Auth (Better Auth). Google fields are optional until creds are added.
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Meals AI. Optional; analysis falls back to Claude estimates without FatSecret.
  ANTHROPIC_API_KEY: z.string().optional(),
  FATSECRET_CLIENT_ID: z.string().optional(),
  FATSECRET_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Passed to ConfigModule.forRoot({ validate }). Throws with readable errors on invalid env. */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
