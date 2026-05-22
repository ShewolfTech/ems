// backend/src/config/infra/database.ts
import pg from 'pg';
const { Pool } = pg;
import { Kysely, PostgresDialect } from 'kysely';
import { DB as Database } from '../../../../shared/src/db/kysely.generated.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure path leads to backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

/**
 * The typed Kysely instance used by all Services.
 * It provides autocomplete based on your SQL schema.
 */
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

// Alias for external imports or legacy code
export { pool as database };

