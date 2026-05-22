//-- a/file:///c%3A/Bright/ems/backend/src/config/infra/database.ts
// backend/src/config/infra/database.ts
import { Pool } from 'pg';
import { env } from './env.js';
export const database = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});
