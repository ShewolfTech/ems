// backend/src/infrastructure/supabase.ts

import { createClient } from "@supabase/supabase-js";
import { env } from "../config/infra/env.js";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
