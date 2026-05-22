-- 1. Generate professional Display Names from the Resource column
-- Explicitly allow updating all rows
UPDATE public.route_permissions
SET display_name = INITCAP(REPLACE(resource, '_', ' '))
WHERE TRUE;

DROP FUNCTION IF EXISTS public.fn_auto_link_permission_id();
DROP FUNCTION IF EXISTS public.fn_sync_user_session_props();
DROP FUNCTION IF EXISTS public.fn_sync_user_auth_uid();

-- This function syncs user auth mappings upon new user creation [cite: 2026-02-10]

-- 1. The Function that does the work
-- Function: keep user_auth_map in sync
CREATE OR REPLACE FUNCTION public.fn_sync_user_auth_uid()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_auth_map (user_id, auth_uid)
    VALUES (NEW.id, NEW.auth_uid)
    ON CONFLICT (user_id) DO UPDATE
    SET auth_uid = EXCLUDED.auth_uid;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fire when auth_uid is updated in public.users
DROP TRIGGER IF EXISTS trg_sync_user_auth_uid ON public.users;

CREATE TRIGGER trg_sync_user_auth_uid
AFTER UPDATE OF auth_uid ON public.users
FOR EACH ROW
WHEN (NEW.auth_uid IS NOT NULL)
EXECUTE FUNCTION public.fn_sync_user_auth_uid();

-- update: auto-link permission_key in user_permissions
CREATE OR REPLACE FUNCTION public.fn_auto_link_permission_key()
RETURNS TRIGGER AS $$
BEGIN
    -- Pull the permission_key directly from the permissions table
    SELECT permission_key INTO NEW.permission_key
    FROM public.permissions
    WHERE module = NEW.module
      AND action = NEW.action
      AND is_active = TRUE
      AND is_deleted = FALSE
    LIMIT 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (commented-out pruning script remains unchanged)
/*

--- ✅ Matrix‑Style Pruning Script

-- Purpose: Remove specific module permissions from certain roles for school_id 10003
-- Define exclusions: which roles should NOT have which modules
WITH exclusions AS (
  SELECT r.id AS role_id, p.module
  FROM public.roles r
  CROSS JOIN (VALUES
    ('Students','Finance'),
    ('Students','Admissions'),
    ('Classroom Teacher','Finance'),
    ('Subject Teacher','Finance'),
    ('Library Assistant / Aide','Finance'),
    ('Custodian / Janitor','Academics'),
    ('School Cook / Chef','Library'),
    ('Security Guard','Admissions')
  ) AS e(role_name, module)
  JOIN public.permissions p ON p.module = e.module
  WHERE r.name = e.role_name
)
DELETE FROM public.role_permissions rp
USING exclusions ex
WHERE rp.role_id = ex.role_id
  AND rp.school_id = 10003
  AND rp.permission_key IN (
    SELECT permission_key FROM public.permissions WHERE module = ex.module
  );
*/


/*
-- Insert missing users into auth.users based on public.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, created_at, updated_at)
SELECT
  gen_random_uuid(),   -- generate a new UUID for auth.users.id
  '00000000-0000-0000-0000-000000000000', -- default instance_id
  u.email,
  crypt(u.password, gen_salt('bf')), -- hash if you stored plain password
  now(),
  now()
FROM public.users u
WHERE u.auth_uid IS NULL
  AND u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users a WHERE lower(a.email) = lower(u.email)
  );


*/

-- backfill permissions--
INSERT INTO permissions (name, resource, module, action, description)
SELECT 
  INITCAP(REPLACE(v.table_name, '_', ' ')) || ' Read' AS name,
  v.table_name || '.read' AS resource,
  split_part(v.table_name, '_', 1) AS module,
  'read' AS action,
  'Auto-generated permission for view ' || v.table_name AS description
FROM information_schema.views AS v
WHERE v.table_schema = 'public'
  AND v.table_name NOT IN (
    SELECT regexp_replace(p.resource, '\..*$', '') FROM permissions AS p
  );
