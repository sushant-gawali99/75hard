import { z } from 'zod';

/** Environment schema — validated at boot so misconfig fails fast and loud. */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  // Added in FND-4 when Postgres is wired:
  DATABASE_URL: z.string().url().optional(),
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
