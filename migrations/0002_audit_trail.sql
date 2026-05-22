-- ============================================
-- Audit Trail Setup (Clean, Idempotent & Multi-Tenant Aware)
-- Supports both school-scoped AND global tables
-- ============================================

-- 1. Mapping table: Supabase UUID → internal BIGINT user_id
CREATE TABLE IF NOT EXISTS user_auth_map (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    auth_uid UUID UNIQUE NOT NULL
);

GRANT ALL ON user_auth_map TO service_role;

-- 2. Helper: resolve current user (UUID → BIGINT)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user BIGINT;
BEGIN
    SELECT user_id INTO v_user
    FROM user_auth_map
    WHERE auth_uid = auth.uid();
    RETURN v_user;
END;
$$;

-- 3. Sync trigger: keep mapping updated from `users` table
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

DROP TRIGGER IF EXISTS trg_sync_user_auth_map ON users;
CREATE TRIGGER trg_sync_user_auth_map
AFTER INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.auth_uid IS NOT NULL)
EXECUTE FUNCTION sync_user_auth_map();

-- 4. Auditlogs table — school_id is NULLABLE to support global resources
CREATE TABLE IF NOT EXISTS auditlogs (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NULL REFERENCES schools(id) ON DELETE CASCADE, -- explicitly nullable
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    role_id BIGINT,
    permission_resource VARCHAR(100),
    resource_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    resource_id BIGINT,
    old_value JSONB,
    new_value JSONB,
    diff JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_auditlogs_school ON auditlogs(school_id);
CREATE INDEX IF NOT EXISTS idx_auditlogs_user ON auditlogs(user_id);
CREATE INDEX IF NOT EXISTS idx_auditlogs_resource ON auditlogs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_auditlogs_action ON auditlogs(action);

-- 6. RLS Policy
ALTER TABLE auditlogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auditlogs_isolation ON auditlogs;

CREATE POLICY auditlogs_isolation ON auditlogs
FOR ALL TO authenticated
USING (
    NOT is_deleted
    AND (
        school_id IS NULL
        OR school_id = current_school_id()
    )
)
WITH CHECK (
    NOT is_deleted
    AND (
        school_id IS NULL
        OR school_id = current_school_id()
    )
);

-- 7. Helper: resolve permission resource
DROP FUNCTION IF EXISTS public.resolve_permission_code(NAME,TEXT);
DROP FUNCTION IF EXISTS public.resolve_permission_resource(NAME,TEXT);

CREATE OR REPLACE FUNCTION public.resolve_permission_resource(
    _table NAME, _op TEXT
) RETURNS TEXT AS $$
DECLARE _perm_key TEXT;
BEGIN
    SELECT p.permission_key INTO _perm_key
    FROM route_permissions rp
    JOIN permissions p ON rp.permission_key = p.permission_key   -- ✅ corrected join
    WHERE rp.resource = _table
      AND rp.method = CASE lower(_op)
                        WHEN 'insert' THEN 'POST'
                        WHEN 'update' THEN 'PUT'
                        WHEN 'delete' THEN 'DELETE'
                        WHEN 'select' THEN 'GET'
                      END
      AND rp.is_active = TRUE
    LIMIT 1;

    RETURN _perm_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- 8. Audit Trigger Function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old JSONB := NULL;
    v_new JSONB := NULL;
    v_diff JSONB := NULL;
    v_school BIGINT;
    v_user BIGINT;
    v_role BIGINT;
    v_perm TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        v_diff := (hstore(NEW) - hstore(OLD))::jsonb;
    ELSIF (TG_OP = 'INSERT') THEN
        v_new := to_jsonb(NEW);
    END IF;

    BEGIN
        IF (TG_OP = 'DELETE') THEN
            v_school := OLD.school_id;
        ELSE
            v_school := NEW.school_id;
        END IF;
        -- Treat 0 as global/system (no valid school)
        IF v_school = 0 THEN
            v_school := NULL;
        END IF;
    EXCEPTION WHEN undefined_column THEN
        v_school := NULL;
    END;

    v_user := current_user_id();
    v_role := current_role_id();
    v_perm := resolve_permission_resource(TG_TABLE_NAME, lower(TG_OP)); -- ✅ now returns permission_key

    INSERT INTO auditlogs (
        school_id,
        user_id,
        role_id,
        permission_resource,   -- ✅ stores permission_key
        resource_type,
        action,
        resource_id,
        old_value,
        new_value,
        diff,
        created_at,
        created_by
    )
    VALUES (
        v_school,
        v_user,
        v_role,
        v_perm,
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        v_old,
        v_new,
        v_diff,
        NOW(),
        v_user
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- 9. Manual Audit Logging
CREATE OR REPLACE FUNCTION insert_audit_log(
    _school_id BIGINT,
    _user_id BIGINT,
    _resource_type VARCHAR,
    _action VARCHAR,
    _resource_id BIGINT,
    _old_value JSONB DEFAULT NULL,
    _new_value JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    ) VALUES (
        _school_id,
        _user_id,
        _resource_type,
        _action,
        _resource_id,
        _old_value,
        _new_value,
        NOW(),
        _user_id
    );
END;
$$;

-- 10. Reporting Functions
CREATE OR REPLACE FUNCTION list_my_auditlogs()
RETURNS SETOF auditlogs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM auditlogs
    WHERE NOT is_deleted
      AND (school_id IS NULL OR school_id = current_school_id())
    ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION list_auditlogs(_school_id BIGINT)
RETURNS SETOF auditlogs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM auditlogs
    WHERE school_id = _school_id AND NOT is_deleted
    ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION report_auditlogs_summary(_school_id BIGINT)
RETURNS TABLE (resource_type VARCHAR, action VARCHAR, total_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT al.resource_type, al.action, COUNT(*)
    FROM auditlogs al
    WHERE al.school_id = _school_id AND NOT al.is_deleted
    GROUP BY al.resource_type, al.action
    ORDER BY al.resource_type, al.action;
END;
$$;

CREATE OR REPLACE FUNCTION report_auditlogs_by_resource(
    _school_id BIGINT,
    _resource_type VARCHAR,
    _resource_id BIGINT
)
RETURNS SETOF auditlogs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM auditlogs
    WHERE school_id = _school_id
      AND resource_type = _resource_type
      AND resource_id = _resource_id
      AND NOT is_deleted
    ORDER BY created_at DESC;
END;
$$;

-- 11. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON auditlogs TO authenticated;

GRANT EXECUTE ON FUNCTION current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit() TO authenticated;
GRANT EXECUTE ON FUNCTION insert_audit_log(BIGINT, BIGINT, VARCHAR, VARCHAR, BIGINT, JSONB, JSONB) TO authenticated;

GRANT EXECUTE ON FUNCTION list_my_auditlogs() TO authenticated;
GRANT EXECUTE ON FUNCTION list_auditlogs(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_auditlogs_summary(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_auditlogs_by_resource(BIGINT, VARCHAR, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_permission_resource(NAME, TEXT) TO authenticated;

