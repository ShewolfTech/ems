-- ============================================
-- 00_helpers.sql
-- Core Utility Functions for Audit + Permissions
-- ============================================

-- 1. Updated_at helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Current User (UUID → BIGINT)
-- Requires user_auth_map table to exist
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user BIGINT;
BEGIN
    SELECT user_id
    INTO v_user
    FROM user_auth_map
    WHERE auth_uid = auth.uid();

    RETURN v_user;
END;
$$;


-- 3. Current School (resolve from users table)
CREATE OR REPLACE FUNCTION current_school_id()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_school BIGINT;
BEGIN
    SELECT school_id
    INTO v_school
    FROM users
    WHERE id = current_user_id();

    RETURN v_school;
END;
$$;

-- Helper: Resolve current role_id for the logged-in user
-- Requires user_roles table to exist
CREATE OR REPLACE FUNCTION current_role_id()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role BIGINT;
BEGIN
    BEGIN
        SELECT role_id
        INTO v_role
        FROM user_roles
        WHERE user_id = current_user_id()
          AND school_id = current_school_id()
          AND is_active = TRUE
          AND is_deleted = FALSE
        LIMIT 1;
    EXCEPTION WHEN undefined_table THEN
        -- Table not yet created → return NULL
        RETURN NULL;
    END;

    RETURN v_role;
END;
$$;


-- 4. Permission check helper
CREATE OR REPLACE FUNCTION has_permission(_module VARCHAR, _action VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_permissions up
        WHERE up.user_id = current_user_id()
          AND up.school_id = current_school_id()
          AND up.module = _module
          AND up.action = _action
          AND up.is_allowed = TRUE
          AND up.is_active = TRUE
          AND up.is_deleted = FALSE
    );
END;
$$;

-- 5. Permission enforcement helper
CREATE OR REPLACE FUNCTION require_permission(_module VARCHAR, _action VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT has_permission(_module, _action) THEN
        RAISE EXCEPTION 'Permission denied for % on %', _action, _module;
    END IF;
END;
$$;

-- 6. log_audit helper
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old JSONB := NULL;
    v_new JSONB := NULL;
    v_school BIGINT;
    v_user BIGINT;
BEGIN
    -- 1. Identify the Action and Capture Data
    IF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_new := to_jsonb(NEW);
    END IF;

    -- 2. Resolve school_id (tenant vs global)
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            v_school := OLD.school_id;
        ELSE
            v_school := NEW.school_id;
        END IF;
    EXCEPTION WHEN undefined_column THEN
        -- Table has no school_id → treat as global/system
        v_school := NULL;  -- ✅ nullable for global logs
    END;

    -- 3. Resolve actor (user_id)
    v_user := current_user_id();

    -- 4. Execute Audit Entry
    INSERT INTO auditlogs (
        school_id,
        user_id,
        resource_type,
        action,
        resource_id,
        old_value,
        new_value,
        created_at,
        created_by
    )
    VALUES (
        v_school,
        v_user,
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        v_old,
        v_new,
        NOW(),
        v_user
    );

    -- 5. Return Control
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


-- 7. Sync helper: keep user_auth_map in sync with users.auth_uid
CREATE OR REPLACE FUNCTION sync_user_auth_map()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_auth_map (user_id, auth_uid)
    VALUES (NEW.id, NEW.auth_uid)
    ON CONFLICT (user_id) DO UPDATE
    SET auth_uid = EXCLUDED.auth_uid;

    RETURN NEW;
END;
$$;

-- 8. Global audit function: always logs with school_id = 0
CREATE OR REPLACE FUNCTION log_audit_global()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old JSONB := NULL;
    v_new JSONB := NULL;
    v_user BIGINT;
BEGIN
    -- Capture old/new values
    IF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_new := to_jsonb(NEW);
    END IF;

    -- Actor
    v_user := current_user_id();

    -- Insert audit entry with NULL school_id (global)
    INSERT INTO auditlogs (
        school_id,
        user_id,
        resource_type,
        action,
        resource_id,
        old_value,
        new_value,
        created_at,
        created_by
    )
    VALUES (
        NULL, -- ✅ always global
        v_user,
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        v_old,
        v_new,
        NOW(),
        v_user
    );

    -- Return control
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


-- Helper: Resolve permission code automatically from route_permissions
CREATE OR REPLACE FUNCTION resolve_permission_code(_table name, _op text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code text;
BEGIN
    SELECT p.code
    INTO v_code
    FROM route_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.resource = _table
      AND rp.method = CASE lower(_op)
                        WHEN 'insert' THEN 'POST'
                        WHEN 'update' THEN 'PUT'
                        WHEN 'delete' THEN 'DELETE'
                        WHEN 'select' THEN 'GET'
                      END
      AND rp.is_active = TRUE
    LIMIT 1;

    RETURN v_code;
END;
$$;
