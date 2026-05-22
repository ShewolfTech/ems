-- ============================================
-- ☢️ DANGER: TOTAL RESET SCRIPT
-- This will wipe all Data, Schema, and Auth Users
-- ============================================

-- 1. Reset the Public Schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;

-- 2. Clear the Auth Vault
-- We use WHERE id IS NOT NULL to bypass "Safe Update" restrictions
DELETE FROM auth.users WHERE id IS NOT NULL;

-- 3. Reset Search Path to include both schemas
-- This is critical so triggers can find both tables
SET search_path TO public, auth;

-- 4. Restore Extensions
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 5. Restore Dangerous Helper (for Service Role migrations)
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- 6. Re-establish Permissions
REVOKE ALL ON FUNCTION public.execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT CREATE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- ✅ Database is now a clean slate.
-- ============================================
