import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// `generate` works offline (no DB). `migrate`/`studio` need DATABASE_URL in apps/api/.env.
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
