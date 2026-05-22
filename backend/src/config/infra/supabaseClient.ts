// src/config/infra/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.SUPABASE_ANON_KEY || serviceRoleKey; // Fallback to service role if anon not set

// Admin client (service role key) - for server-side admin operations
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Regular client (anon key) - for user authentication operations
export const supabaseClient = createClient(supabaseUrl, anonKey);

// Alias for backwards compatibility
export const supabase = supabaseClient;




