// -- a/file:///c%3A/Bright/ems/backend/src/config/infra/env.ts
// backend/src/config/infra/env.ts
import 'dotenv/config';
export const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
