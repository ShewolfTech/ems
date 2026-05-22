// backend/src/config/infra/env.ts
import 'dotenv/config';

type EnvVars = {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;   // 🔑 add this
  NODE_ENV: string;              // optional, but handy
};

function requireEnv(key: keyof EnvVars): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvVars = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET: requireEnv('SUPABASE_JWT_SECRET'), // ✅ now recognized
  NODE_ENV: process.env.NODE_ENV || 'development',
};
