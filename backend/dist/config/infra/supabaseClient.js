// -- a/file:///c%3A/Bright/ems/backend/src/config/infra/supabaseClient.ts
// src/config/infra/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
export const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY // <-- use the defined property
);
