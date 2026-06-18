import 'dotenv/config';

import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

/**
 * Standalone migration runner for production (Railway pre-deploy command).
 * Uses drizzle-orm's migrator (a prod dependency) so the runtime image does not
 * need drizzle-kit. Applies every pending file in apps/api/drizzle/.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  // dist/migrate.js -> ../drizzle resolves to apps/api/drizzle (the SQL + meta).
  const migrationsFolder = path.join(__dirname, '..', 'drizzle');
  console.log(`[migrate] applying migrations from ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log('[migrate] done');

  await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
