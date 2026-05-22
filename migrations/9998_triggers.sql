-- ============================================
-- Trigger Pack: Updated_at + Audit
-- Safe, idempotent triggers for all core tables
-- ============================================

-- Roles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roles_updated_at' AND tgrelid = 'roles'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_roles_updated_at ON roles';
    END IF;
END$$;
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roles_audit' AND tgrelid = 'roles'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_roles_audit ON roles';
    END IF;
END$$;
CREATE TRIGGER trg_roles_audit AFTER INSERT OR UPDATE OR DELETE ON roles FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Students
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_students_updated_at' AND tgrelid = 'students'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_students_updated_at ON students';
    END IF;
END$$;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_students_audit' AND tgrelid = 'students'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_students_audit ON students';
    END IF;
END$$;
CREATE TRIGGER trg_students_audit AFTER INSERT OR UPDATE OR DELETE ON students FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Classes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_classes_updated_at' AND tgrelid = 'classes'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_classes_updated_at ON classes';
    END IF;
END$$;
CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_classes_audit' AND tgrelid = 'classes'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_classes_audit ON classes';
    END IF;
END$$;
CREATE TRIGGER trg_classes_audit AFTER INSERT OR UPDATE OR DELETE ON classes FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Subjects
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subjects_updated_at' AND tgrelid = 'subjects'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_subjects_updated_at ON subjects';
    END IF;
END$$;
CREATE TRIGGER trg_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subjects_audit' AND tgrelid = 'subjects'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_subjects_audit ON subjects';
    END IF;
END$$;
CREATE TRIGGER trg_subjects_audit AFTER INSERT OR UPDATE OR DELETE ON subjects FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Assessments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_assessments_updated_at' AND tgrelid = 'assessments'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_assessments_updated_at ON assessments';
    END IF;
END$$;
CREATE TRIGGER trg_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_assessments_audit' AND tgrelid = 'assessments'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_assessments_audit ON assessments';
    END IF;
END$$;
CREATE TRIGGER trg_assessments_audit AFTER INSERT OR UPDATE OR DELETE ON assessments FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Lessons
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lessons_updated_at' AND tgrelid = 'lessons'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_lessons_updated_at ON lessons';
    END IF;
END$$;
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lessons_audit' AND tgrelid = 'lessons'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_lessons_audit ON lessons';
    END IF;
END$$;
CREATE TRIGGER trg_lessons_audit AFTER INSERT OR UPDATE OR DELETE ON lessons FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Assignments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_assignments_updated_at' AND tgrelid = 'assignments'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_assignments_updated_at ON assignments';
    END IF;
END$$;
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_assignments_audit' AND tgrelid = 'assignments'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_assignments_audit ON assignments';
    END IF;
END$$;
CREATE TRIGGER trg_assignments_audit AFTER INSERT OR UPDATE OR DELETE ON assignments FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Exams
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_exams_updated_at' AND tgrelid = 'exams'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_exams_updated_at ON exams';
    END IF;
END$$;
CREATE TRIGGER trg_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_exams_audit' AND tgrelid = 'exams'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_exams_audit ON exams';
    END IF;
END$$;
CREATE TRIGGER trg_exams_audit AFTER INSERT OR UPDATE OR DELETE ON exams FOR EACH ROW EXECUTE FUNCTION log_audit();


CREATE OR REPLACE VIEW auditlogs_report AS
SELECT
    id,
    CASE WHEN school_id = 0 THEN 'GLOBAL' ELSE school_id::TEXT END AS school_scope,
    user_id,
    action,
    resource_type,
    resource_id,
    old_value,
    new_value,
    created_at,
    created_by
FROM auditlogs
WHERE is_deleted = FALSE;

-- create: auto-sync permission_id in user_permissions

-- STEP 1: Create or Replace the Function
CREATE OR REPLACE FUNCTION public.fn_sync_permission_id()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Find the ID from the master permissions table
    SELECT id INTO NEW.permission_id
    FROM public.permissions
    WHERE module = NEW.module
      AND resource = NEW.resource 
      AND action = NEW.action
    LIMIT 1;

    -- 2. Professional Timestamp Management
    NEW.updated_at = NOW();

    -- 3. Logical Revocation [cite: 2025-12-26]
    -- If is_allowed flips to false, record the time
    IF (TG_OP = 'UPDATE') THEN
        IF NEW.is_allowed = FALSE AND OLD.is_allowed = TRUE THEN
            NEW.revoked_at = NOW();
        -- If re-allowed, clear the revocation timestamp
        ELSIF NEW.is_allowed = TRUE AND OLD.is_allowed = FALSE THEN
            NEW.revoked_at = NULL;
        END IF;
    ELSIF (TG_OP = 'INSERT' AND NEW.is_allowed = FALSE) THEN
        NEW.revoked_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 2: Drop and Re-create the Trigger
DROP TRIGGER IF EXISTS trg_user_permissions_auto_sync ON public.user_permissions;

CREATE TRIGGER trg_user_permissions_auto_sync
BEFORE INSERT OR UPDATE OF module, resource, action, is_allowed ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_permission_id();

--- auth.users sync triggers: with public.users

CREATE OR REPLACE FUNCTION public.fn_sync_user_auth_uid()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. If auth_uid is being set for the first time or changed
  -- Ensure the corresponding record in auth.users is updated with current public info
  UPDATE auth.users
  SET 
    email = NEW.email,
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb), 
      '{username}', 
      to_jsonb(NEW.username)
    )
  WHERE id = NEW.auth_uid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;