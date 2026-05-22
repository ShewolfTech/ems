
-- ============================================
-- Bit 1: schools (Tenant-Aware with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS schools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    logo_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'Africa/Kampala',
    is_active BOOLEAN DEFAULT TRUE, -- ✅ lifecycle toggle
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='schools' AND policyname='schools_isolation'
    ) THEN
        EXECUTE 'DROP POLICY schools_isolation ON schools';
    END IF;
END$$;

CREATE POLICY schools_isolation ON schools
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_district ON schools(district_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_schools_updated_at ON schools;
CREATE TRIGGER trg_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_schools_audit ON schools;
CREATE TRIGGER trg_schools_audit
AFTER INSERT OR UPDATE OR DELETE ON schools
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_school(
    _name TEXT,_code TEXT,_address TEXT,_district_id BIGINT,
    _contact_email TEXT,_contact_phone TEXT,_logo_url TEXT,
    _timezone TEXT,_settings JSONB
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('schools','insert');

    INSERT INTO schools (
        name,code,address,district_id,contact_email,contact_phone,
        logo_url,timezone,is_active,settings,created_by
    )
    VALUES (
        _name,_code,_address,_district_id,_contact_email,_contact_phone,
        _logo_url,COALESCE(_timezone,'Africa/Kampala'),
        TRUE,_settings,current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_school(
    _id BIGINT,_name TEXT,_address TEXT,_district_id BIGINT,
    _contact_email TEXT,_contact_phone TEXT,_logo_url TEXT,
    _timezone TEXT,_is_active BOOLEAN,_settings JSONB
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('schools','update');

    UPDATE schools SET
        name = COALESCE(_name,name),
        address = COALESCE(_address,address),
        district_id = COALESCE(_district_id,district_id),
        contact_email = COALESCE(_contact_email,contact_email),
        contact_phone = COALESCE(_contact_phone,contact_phone),
        logo_url = COALESCE(_logo_url,logo_url),
        timezone = COALESCE(_timezone,timezone),
        is_active = COALESCE(_is_active,is_active),
        settings = COALESCE(_settings,settings),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_school(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('schools','delete');

    UPDATE schools
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_school(_id BIGINT) RETURNS SETOF schools AS $$
BEGIN
    PERFORM require_permission('schools','view');

    RETURN QUERY
    SELECT *
    FROM schools
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records)
CREATE OR REPLACE FUNCTION list_schools() RETURNS SETOF schools AS $$
BEGIN
    PERFORM require_permission('schools','view');

    RETURN QUERY
    SELECT *
    FROM schools
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active schools only
CREATE OR REPLACE FUNCTION list_active_schools() RETURNS SETOF schools AS $$
BEGIN
    PERFORM require_permission('schools','view');

    RETURN QUERY
    SELECT *
    FROM schools
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List schools by district
CREATE OR REPLACE FUNCTION list_schools_by_district(_district_id BIGINT) RETURNS SETOF schools AS $$
BEGIN
    PERFORM require_permission('schools','view');

    RETURN QUERY
    SELECT *
    FROM schools
    WHERE district_id = _district_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_schools_summary() RETURNS TABLE (
    total_schools BIGINT,
    active_schools BIGINT
) AS $$
BEGIN
    PERFORM require_permission('schools','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_schools,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_schools
    FROM schools
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON schools TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_school(TEXT,TEXT,TEXT,BIGINT,TEXT,TEXT,TEXT,TEXT,JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_school(BIGINT,TEXT,TEXT,BIGINT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_school(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_school(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_schools() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_schools() TO authenticated;
GRANT EXECUTE ON FUNCTION list_schools_by_district(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_schools_summary() TO authenticated;


-- ============================================
-- Bit 2: roles (System Roles with Permissions + Reporting)
-- ============================================

-- Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    code INT NOT NULL UNIQUE,                 -- stable business key (e.g., 100 = Principal)
    module VARCHAR(50) NOT NULL,              -- e.g., academics, finance, system
    name VARCHAR(50) NOT NULL UNIQUE,         -- human-readable role name
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = built-in, protected
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
    -- Optional: prevent empty/whitespace names
    -- CONSTRAINT roles_name_not_blank CHECK (btrim(name) <> '')
);

-- Optional: if you want to allow duplicate names when soft-deleted, use partial unique index instead of UNIQUE(name)
-- DROP INDEX IF EXISTS uq_roles_name_active;
-- CREATE UNIQUE INDEX uq_roles_name_active ON roles (name) WHERE is_deleted = FALSE;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='roles' AND policyname='roles_isolation'
    ) THEN
        EXECUTE 'DROP POLICY roles_isolation ON roles';
    END IF;
END$$;

CREATE POLICY roles_isolation ON roles
    FOR ALL TO authenticated
    USING (is_deleted = FALSE)
    WITH CHECK (is_deleted = FALSE);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_roles_name   ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_module ON roles(module);

-- Optional: faster lookups for active roles by name
CREATE INDEX IF NOT EXISTS idx_roles_name_active ON roles(name) WHERE is_deleted = FALSE;

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_roles_audit ON roles;
CREATE TRIGGER trg_roles_audit
AFTER INSERT OR UPDATE OR DELETE ON roles
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD & Seeding Functions with Permission Checks
-- ============================================

-- INSERT (returns id)
CREATE OR REPLACE FUNCTION insert_role(
    _code INT,
    _module TEXT,
    _name TEXT,
    _description TEXT,
    _is_system BOOLEAN DEFAULT FALSE
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('roles','insert');

    INSERT INTO roles (code, module, name, description, is_system, created_by)
    VALUES (_code, _module, _name, _description, COALESCE(_is_system, FALSE), current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPSERT by code (idempotent seeding)
CREATE OR REPLACE FUNCTION upsert_role_by_code(
    _code INT,
    _module TEXT,
    _name TEXT,
    _description TEXT,
    _is_system BOOLEAN DEFAULT FALSE
) RETURNS BIGINT AS $$
DECLARE upsert_id BIGINT;
BEGIN
    PERFORM require_permission('roles','insert');

    INSERT INTO roles (code, module, name, description, is_system, created_by)
    VALUES (_code, _module, _name, _description, COALESCE(_is_system, FALSE), current_user_id())
    ON CONFLICT (code) DO UPDATE SET
        module      = EXCLUDED.module,
        name        = EXCLUDED.name,
        description = EXCLUDED.description,
        -- protect system roles from being flipped off/on unintentionally
        is_system   = CASE WHEN roles.is_system = TRUE THEN TRUE ELSE EXCLUDED.is_system END,
        updated_at  = NOW(),
        updated_by  = current_user_id()
    RETURNING id INTO upsert_id;

    RETURN upsert_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE (by id)
CREATE OR REPLACE FUNCTION update_role(
    _id BIGINT,
    _code INT,
    _module TEXT,
    _name TEXT,
    _description TEXT,
    _is_system BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('roles','update');

    -- prevent toggling system flag for system roles
    UPDATE roles SET
        code        = COALESCE(_code, code),
        module      = COALESCE(_module, module),
        name        = COALESCE(_name, name),
        description = COALESCE(_description, description),
        is_system   = CASE WHEN is_system = TRUE THEN TRUE ELSE COALESCE(_is_system, is_system) END,
        updated_at  = NOW(),
        updated_by  = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE (protect system roles)
CREATE OR REPLACE FUNCTION soft_delete_role(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('roles','delete');

    UPDATE roles
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE AND is_system = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT (single)
CREATE OR REPLACE FUNCTION select_role(_id BIGINT) RETURNS SETOF roles AS $$
BEGIN
    PERFORM require_permission('roles','view');

    RETURN QUERY
    SELECT *
    FROM roles
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST (all active)
CREATE OR REPLACE FUNCTION list_roles() RETURNS SETOF roles AS $$
BEGIN
    PERFORM require_permission('roles','view');

    RETURN QUERY
    SELECT *
    FROM roles
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List system roles
CREATE OR REPLACE FUNCTION list_system_roles() RETURNS SETOF roles AS $$
BEGIN
    PERFORM require_permission('roles','view');

    RETURN QUERY
    SELECT *
    FROM roles
    WHERE is_system = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List non-system roles
CREATE OR REPLACE FUNCTION list_custom_roles() RETURNS SETOF roles AS $$
BEGIN
    PERFORM require_permission('roles','view');

    RETURN QUERY
    SELECT *
    FROM roles
    WHERE is_system = FALSE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Summary counts
CREATE OR REPLACE FUNCTION report_roles_summary() RETURNS TABLE (
    total_roles BIGINT,
    system_roles BIGINT,
    custom_roles BIGINT
) AS $$
BEGIN
    PERFORM require_permission('roles','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_roles,
           COUNT(*) FILTER (WHERE is_system = TRUE AND is_deleted = FALSE) AS system_roles,
           COUNT(*) FILTER (WHERE is_system = FALSE AND is_deleted = FALSE) AS custom_roles
    FROM roles
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT, INSERT, UPDATE ON roles TO authenticated;

GRANT EXECUTE ON FUNCTION insert_role(INT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_role_by_code(INT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_role(BIGINT, INT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_role(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_role(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_roles() TO authenticated;

GRANT EXECUTE ON FUNCTION list_system_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION list_custom_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION report_roles_summary() TO authenticated;


--------------------------


-- ============================================
-- School-Specific Reference Tables
-- Grade Levels, Streams, Classes, Academic Years, Subjects
-- ============================================

-- Grade Levels (e.g., Grade 1-12, S1-S6)
CREATE TABLE IF NOT EXISTS grade_levels (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT grade_levels_unique_code UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_grade_levels_school ON grade_levels(school_id);

-- Streams (e.g., Science, Arts, Commerce)
CREATE TABLE IF NOT EXISTS streams (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT streams_unique_code UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_streams_school ON streams(school_id);

-- Classes (grade + stream + year)
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade_level_id BIGINT REFERENCES grade_levels(id) ON DELETE SET NULL,
  stream_id BIGINT REFERENCES streams(id) ON DELETE SET NULL,
  academic_year VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  teacher_id BIGINT,
  room VARCHAR(50),
  capacity INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT classes_unique_code UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade_level_id);
CREATE INDEX IF NOT EXISTS idx_classes_stream ON classes(stream_id);

-- Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT academic_years_unique_name UNIQUE (school_id, name)
);

CREATE INDEX IF NOT EXISTS idx_academic_years_school ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_current ON academic_years(is_current);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  subject_area VARCHAR(100),
  description TEXT,
  is_core BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT subjects_unique_code UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_area ON subjects(subject_area);

-- RLS for school-specific tables
ALTER TABLE grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='grade_levels' AND policyname='grade_levels_isolation') THEN
    CREATE POLICY grade_levels_isolation ON grade_levels
      FOR ALL TO authenticated
      USING (school_id = current_school_id() AND NOT is_deleted)
      WITH CHECK (school_id = current_school_id() AND NOT is_deleted);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='streams' AND policyname='streams_isolation') THEN
    CREATE POLICY streams_isolation ON streams
      FOR ALL TO authenticated
      USING (school_id = current_school_id() AND NOT is_deleted)
      WITH CHECK (school_id = current_school_id() AND NOT is_deleted);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='classes' AND policyname='classes_isolation') THEN
    CREATE POLICY classes_isolation ON classes
      FOR ALL TO authenticated
      USING (school_id = current_school_id() AND NOT is_deleted)
      WITH CHECK (school_id = current_school_id() AND NOT is_deleted);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='academic_years' AND policyname='academic_years_isolation') THEN
    CREATE POLICY academic_years_isolation ON academic_years
      FOR ALL TO authenticated
      USING (school_id = current_school_id() AND NOT is_deleted)
      WITH CHECK (school_id = current_school_id() AND NOT is_deleted);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subjects' AND policyname='subjects_isolation') THEN
    CREATE POLICY subjects_isolation ON subjects
      FOR ALL TO authenticated
      USING (school_id = current_school_id() AND NOT is_deleted)
      WITH CHECK (school_id = current_school_id() AND NOT is_deleted);
  END IF;
END $$;

-- Triggers
DROP TRIGGER IF EXISTS trg_grade_levels_updated ON grade_levels;
CREATE TRIGGER trg_grade_levels_updated BEFORE UPDATE ON grade_levels FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_streams_updated ON streams;
CREATE TRIGGER trg_streams_updated BEFORE UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_classes_updated ON classes;
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_academic_years_updated ON academic_years;
CREATE TRIGGER trg_academic_years_updated BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subjects_updated ON subjects;
CREATE TRIGGER trg_subjects_updated BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Audit Triggers
DROP TRIGGER IF EXISTS trg_grade_levels_audit ON grade_levels;
CREATE TRIGGER trg_grade_levels_audit AFTER INSERT OR UPDATE OR DELETE ON grade_levels FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_streams_audit ON streams;
CREATE TRIGGER trg_streams_audit AFTER INSERT OR UPDATE OR DELETE ON streams FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_classes_audit ON classes;
CREATE TRIGGER trg_classes_audit AFTER INSERT OR UPDATE OR DELETE ON classes FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_academic_years_audit ON academic_years;
CREATE TRIGGER trg_academic_years_audit AFTER INSERT OR UPDATE OR DELETE ON academic_years FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_subjects_audit ON subjects;
CREATE TRIGGER trg_subjects_audit AFTER INSERT OR UPDATE OR DELETE ON subjects FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Note: School-specific seed data is in 99999_seed_school_data.sql


-------------------------


-- ============================================
-- Bit 3: users (Tenant-Aware with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    auth_uid UUID UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(50) DEFAULT 'Ugandan',
    role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    CONSTRAINT users_username_not_blank CHECK (btrim(username) <> ''),
    CONSTRAINT users_email_not_blank CHECK (email IS NULL OR btrim(email) <> ''),
    constraint users_school_username_unique UNIQUE (school_id, username)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_school_username ON users(school_id, username);
CREATE INDEX IF NOT EXISTS idx_users_school_email    ON users(school_id, email);
CREATE INDEX IF NOT EXISTS idx_users_school_auth_uid ON users(school_id, auth_uid);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE is_deleted = FALSE;

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='users' AND policyname='users_isolation'
    ) THEN
        EXECUTE 'DROP POLICY users_isolation ON users';
    END IF;
END$$;

CREATE POLICY users_isolation ON users
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND is_deleted = FALSE)
    WITH CHECK (school_id = current_school_id() AND is_deleted = FALSE);

CREATE POLICY users_service_role ON users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY users_admin ON users
    FOR ALL TO authenticated
    USING (
        school_id = current_school_id() AND is_deleted = FALSE
        OR EXISTS (
            SELECT 1 FROM users u WHERE u.id = current_user_id() AND u.role_id = 1
        )
    )
    WITH CHECK (
        school_id = current_school_id() AND is_deleted = FALSE
        OR EXISTS (
            SELECT 1 FROM users u WHERE u.id = current_user_id() AND u.role_id = 1
        )
    );

GRANT ALL ON users TO service_role;

-- Triggers
DROP TRIGGER IF EXISTS trg_sync_user_auth_map ON users;
CREATE TRIGGER trg_sync_user_auth_map
AFTER INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.auth_uid IS NOT NULL)
EXECUTE FUNCTION sync_user_auth_map();

DROP TRIGGER IF EXISTS trg_users_audit ON users;
CREATE TRIGGER trg_users_audit
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_user(
    _school_id BIGINT,_username TEXT,_email TEXT,_phone TEXT,_password TEXT,
    _first_name TEXT,_last_name TEXT,_date_of_birth DATE,_nationality TEXT,
    _role_id BIGINT,_is_active BOOLEAN,_auth_uid UUID
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('users','insert');

    INSERT INTO users (
        school_id,username,email,phone,password,
        first_name,last_name,date_of_birth,nationality,
        role_id,is_active,auth_uid,created_by
    )
    VALUES (
        _school_id,_username,_email,_phone,_password,
        _first_name,_last_name,_date_of_birth,
        COALESCE(_nationality,'Ugandan'),
        _role_id,COALESCE(_is_active,TRUE),_auth_uid,current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPSERT by username (idempotent seeding)
CREATE OR REPLACE FUNCTION upsert_user_by_username(
    _school_id BIGINT,_username TEXT,_email TEXT,_phone TEXT,_password TEXT,
    _first_name TEXT,_last_name TEXT,_date_of_birth DATE,_nationality TEXT,
    _role_id BIGINT,_is_active BOOLEAN,_auth_uid UUID
) RETURNS BIGINT AS $$
DECLARE upsert_id BIGINT;
BEGIN
    PERFORM require_permission('users','insert');

    INSERT INTO users (
        school_id,username,email,phone,password,
        first_name,last_name,date_of_birth,nationality,
        role_id,is_active,auth_uid,created_by
    )
    VALUES (
        _school_id,_username,_email,_phone,_password,
        _first_name,_last_name,_date_of_birth,
        COALESCE(_nationality,'Ugandan'),
        _role_id,COALESCE(_is_active,TRUE),_auth_uid,current_user_id()
    )
    ON CONFLICT (username) DO UPDATE SET
        email       = EXCLUDED.email,
        phone       = EXCLUDED.phone,
        first_name  = EXCLUDED.first_name,
        last_name   = EXCLUDED.last_name,
        date_of_birth = EXCLUDED.date_of_birth,
        nationality = EXCLUDED.nationality,
        role_id     = EXCLUDED.role_id,
        is_active   = EXCLUDED.is_active,
        auth_uid    = EXCLUDED.auth_uid,
        updated_at  = NOW(),
        updated_by  = current_user_id()
    RETURNING id INTO upsert_id;

    RETURN upsert_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_user(
    _id BIGINT,_email TEXT,_phone TEXT,_first_name TEXT,_last_name TEXT,
    _date_of_birth DATE,_nationality TEXT,_role_id BIGINT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('users','update');

    UPDATE users SET
        email       = COALESCE(_email,email),
        phone       = COALESCE(_phone,phone),
        first_name  = COALESCE(_first_name,first_name),
        last_name   = COALESCE(_last_name,last_name),
        date_of_birth = COALESCE(_date_of_birth,date_of_birth),
        nationality = COALESCE(_nationality,nationality),
        role_id     = COALESCE(_role_id,role_id),
        is_active   = COALESCE(_is_active,is_active),
        updated_at  = NOW(),
        updated_by  = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_user(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('users','delete');

    UPDATE users
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT (single)
CREATE OR REPLACE FUNCTION select_user(_id BIGINT) RETURNS SETOF users AS $$
BEGIN
    PERFORM require_permission('users','view');

    RETURN QUERY
    SELECT *
    FROM users
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST (all active for current school)
CREATE OR REPLACE FUNCTION list_users() RETURNS SETOF users AS $$
BEGIN
    PERFORM require_permission('users','view');

    RETURN QUERY
    SELECT *
    FROM users
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

CREATE OR REPLACE FUNCTION list_active_users() RETURNS SETOF users AS $$
BEGIN
    PERFORM require_permission('users','view');

    RETURN QUERY
    SELECT *
    FROM users
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_users_by_role(_role_id BIGINT) RETURNS SETOF users AS $$
BEGIN
    PERFORM require_permission('users','view');

    RETURN QUERY
    SELECT *
    FROM users
    WHERE school_id = current_school_id()
      AND role_id = _role_id
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION report_users_summary() RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    deleted_users BIGINT
) AS $$
BEGIN
    PERFORM require_permission('users','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_users,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_users,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_users
    FROM users
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE,DELETE ON users TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_user(BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,DATE,TEXT,BIGINT,BOOLEAN,UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user(BIGINT,TEXT,TEXT,TEXT,TEXT,DATE,TEXT,BIGINT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_user(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_user(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_users() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_users() TO authenticated;
GRANT EXECUTE ON FUNCTION list_users_by_role(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_users_summary() TO authenticated;

GRANT EXECUTE ON FUNCTION upsert_user_by_username(
    BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,DATE,TEXT,BIGINT,BOOLEAN,UUID
) TO authenticated;

-- ============================================
-- Bit 4: permissions (Permission Registry with Enforcement + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,             -- Human-readable
    module VARCHAR(50) NOT NULL,            -- e.g., finance, academics
    resource VARCHAR(100) NOT NULL,         -- e.g. 'classes', 'lesson_plans', 'analytics'
    action VARCHAR(50) NOT NULL,            -- CRUD verb
    permission_key VARCHAR(200) GENERATED ALWAYS AS (resource || '.' || action) STORED, -- e.g., 'classes.view'
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    CONSTRAINT permissions_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT permissions_resource_action_unique UNIQUE (resource, action), -- ✅ ensure resource uniqueness
    CONSTRAINT permissions_permission_key_unique UNIQUE (permission_key)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='permissions' AND policyname='permissions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY permissions_isolation ON permissions';
    END IF;
END$$;

CREATE POLICY permissions_isolation ON permissions
    FOR ALL TO authenticated
    USING (is_deleted = FALSE)
    WITH CHECK (is_deleted = FALSE);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_permissions_resource   ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_permission_key ON public.permissions(permission_key);


-- Optional: faster lookups for active permissions
CREATE INDEX IF NOT EXISTS idx_permissions_active ON permissions(resource) WHERE is_deleted = FALSE AND is_active = TRUE;

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_permissions_updated_at ON permissions;
CREATE TRIGGER trg_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_permissions_audit ON permissions;
CREATE TRIGGER trg_permissions_audit
AFTER INSERT OR UPDATE OR DELETE ON permissions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD & Seeding Functions
-- ============================================

-- ============================================
-- INSERT
-- ============================================
CREATE OR REPLACE FUNCTION insert_permission(
    _name TEXT, _resource TEXT, _module TEXT, _action TEXT, _description TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('permissions','insert');

    INSERT INTO permissions (name, resource, module, action, description, is_active, created_by)
    VALUES (_name, _resource, _module, _action, _description, TRUE, current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPSERT by resource (idempotent seeding)
-- ============================================
CREATE OR REPLACE FUNCTION upsert_permission_by_resource(
    _name TEXT, _resource TEXT, _module TEXT, _action TEXT, _description TEXT
) RETURNS BIGINT AS $$
DECLARE upsert_id BIGINT;
BEGIN
    PERFORM require_permission('permissions','insert');

    INSERT INTO permissions (name, resource, module, action, description, is_active, created_by)
    VALUES (_name, _resource, _module, _action, _description, TRUE, current_user_id())
    ON CONFLICT (resource) DO UPDATE SET
        name        = EXCLUDED.name,
        module      = EXCLUDED.module,
        action      = EXCLUDED.action,
        description = EXCLUDED.description,
        is_active   = EXCLUDED.is_active,
        updated_at  = NOW(),
        updated_by  = current_user_id()
    RETURNING id INTO upsert_id;

    RETURN upsert_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION update_permission(
    _id BIGINT, _name TEXT, _module TEXT, _action TEXT, _description TEXT, _is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('permissions','update');

    UPDATE permissions SET
        name        = COALESCE(_name, name),
        module      = COALESCE(_module, module),
        action      = COALESCE(_action, action),
        description = COALESCE(_description, description),
        is_active   = COALESCE(_is_active, is_active),
        updated_at  = NOW(),
        updated_by  = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SOFT DELETE
-- ============================================
CREATE OR REPLACE FUNCTION soft_delete_permission(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('permissions','delete');

    UPDATE permissions
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SELECT (single)
-- ============================================
CREATE OR REPLACE FUNCTION select_permission(_id BIGINT) RETURNS SETOF permissions AS $$
BEGIN
    PERFORM require_permission('permissions','view');

    RETURN QUERY
    SELECT *
    FROM permissions
    WHERE id = _id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- LIST (all active)
-- ============================================
CREATE OR REPLACE FUNCTION list_permissions() RETURNS SETOF permissions AS $$
BEGIN
    PERFORM require_permission('permissions','view');

    RETURN QUERY
    SELECT *
    FROM permissions
    WHERE is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================
CREATE OR REPLACE FUNCTION list_active_permissions() RETURNS SETOF permissions AS $$
BEGIN
    PERFORM require_permission('permissions','view');

    RETURN QUERY
    SELECT *
    FROM permissions
    WHERE is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_permissions_by_module(_module TEXT) RETURNS SETOF permissions AS $$
BEGIN
    PERFORM require_permission('permissions','view');

    RETURN QUERY
    SELECT *
    FROM permissions
    WHERE module = _module AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_permissions_by_action(_action TEXT) RETURNS SETOF permissions AS $$
BEGIN
    PERFORM require_permission('permissions','view');

    RETURN QUERY
    SELECT *
    FROM permissions
    WHERE action = _action AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION report_permissions_summary() RETURNS TABLE (
    total_permissions BIGINT,
    active_permissions BIGINT,
    deleted_permissions BIGINT
) AS $$
BEGIN
    PERFORM require_permission('permissions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_permissions,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_permissions,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_permissions
    FROM permissions;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON permissions TO authenticated;

GRANT EXECUTE ON FUNCTION insert_permission(TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_permission_by_resource(TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_permission(BIGINT,TEXT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_permission(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_permission(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_permissions() TO authenticated;

GRANT EXECUTE ON FUNCTION list_active_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION list_permissions_by_module(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_permissions_by_action(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_permissions_summary() TO authenticated;


-- ============================================
-- Bit 5: role_permissions (RBAC Mapping with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_key VARCHAR(200) NOT NULL REFERENCES permissions(permission_key) ON DELETE CASCADE,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(role_id, permission_key, school_id),
    CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_key, school_id)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='role_permissions' AND policyname='role_permissions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY role_permissions_isolation ON role_permissions';
    END IF;
END$$;

CREATE POLICY role_permissions_isolation ON role_permissions
    FOR ALL TO authenticated
    USING (NOT is_deleted)
    WITH CHECK (NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_key);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_role_permissions_audit ON role_permissions;
CREATE TRIGGER trg_role_permissions_audit
AFTER INSERT OR UPDATE OR DELETE ON role_permissions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_role_permission(
    _role_id BIGINT,_permission_key VARCHAR(200)
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('role_permissions','insert');

    INSERT INTO role_permissions (role_id,permission_key,is_active,created_by)
    VALUES (_role_id,_permission_key,TRUE,current_user_id())
    ON CONFLICT (role_id,permission_key) DO NOTHING;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE (toggle active state)
CREATE OR REPLACE FUNCTION update_role_permission(
    _role_id BIGINT,_permission_key VARCHAR(200),_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('role_permissions','update');

    UPDATE role_permissions SET
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE role_id = _role_id AND permission_key = _permission_key AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_role_permission(
    _role_id BIGINT,_permission_key VARCHAR(200)
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('role_permissions','delete');

    UPDATE role_permissions
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE role_id = _role_id AND permission_key = _permission_key AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_role_permission(
    _role_id BIGINT,_permission_key VARCHAR(200)
) RETURNS SETOF role_permissions AS $$
BEGIN
    PERFORM require_permission('role_permissions','view');

    RETURN QUERY
    SELECT *
    FROM role_permissions
    WHERE role_id = _role_id AND permission_key = _permission_key AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all permissions for a role)
CREATE OR REPLACE FUNCTION list_role_permissions(_role_id BIGINT) RETURNS SETOF role_permissions AS $$
BEGIN
    PERFORM require_permission('role_permissions','view');

    RETURN QUERY
    SELECT *
    FROM role_permissions
    WHERE role_id = _role_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active role permissions for a role
CREATE OR REPLACE FUNCTION list_active_role_permissions(_role_id BIGINT) RETURNS SETOF role_permissions AS $$
BEGIN
    PERFORM require_permission('role_permissions','view');

    RETURN QUERY
    SELECT *
    FROM role_permissions
    WHERE role_id = _role_id AND is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List role permissions by permission_key
CREATE OR REPLACE FUNCTION list_roles_by_permission(_permission_key VARCHAR) 
RETURNS SETOF role_permissions AS $$
BEGIN
    PERFORM require_permission('role_permissions','view');

    RETURN QUERY
    SELECT *
    FROM role_permissions
    WHERE permission_key = _permission_key 
      AND is_deleted = FALSE;
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_role_permissions_summary() RETURNS TABLE (
    total_mappings BIGINT,
    active_mappings BIGINT,
    deleted_mappings BIGINT
) AS $$
BEGIN
    PERFORM require_permission('role_permissions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_mappings,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_mappings,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_mappings
    FROM role_permissions;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE,DELETE ON role_permissions TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_role_permission(BIGINT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION update_role_permission(BIGINT, VARCHAR, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_role_permission(BIGINT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION select_role_permission(BIGINT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION list_role_permissions(BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_role_permissions(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_roles_by_permission(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION report_role_permissions_summary() TO authenticated;

-- ============================================
-- Bit 6: user_roles (RBAC User ↔ Role Mapping with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,  -- surrogate key for audit/logging
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id, school_id)
);


-- ============================================
-- RLS
-- ============================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='user_roles' AND policyname='user_roles_isolation'
    ) THEN
        EXECUTE 'DROP POLICY user_roles_isolation ON user_roles';
    END IF;
END$$;

CREATE POLICY user_roles_isolation ON user_roles
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_school ON user_roles(school_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_composite
ON user_roles(user_id, role_id, school_id);


-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_user_roles_audit ON user_roles;
CREATE TRIGGER trg_user_roles_audit
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- ASSIGN
CREATE OR REPLACE FUNCTION assign_user_role(
    _user_id BIGINT,_role_id BIGINT,_school_id BIGINT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('user_roles','insert');

    INSERT INTO user_roles (user_id,role_id,school_id,is_active,created_by)
    VALUES (_user_id,_role_id,_school_id,TRUE,current_user_id())
    ON CONFLICT (user_id,role_id,school_id) DO NOTHING;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- REVOKE (soft delete)
CREATE OR REPLACE FUNCTION revoke_user_role(
    _user_id BIGINT,_role_id BIGINT,_school_id BIGINT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('user_roles','delete');

    UPDATE user_roles
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE user_id = _user_id AND role_id = _role_id AND school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE (toggle active state)
CREATE OR REPLACE FUNCTION update_user_role(
    _user_id BIGINT,_role_id BIGINT,_school_id BIGINT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('user_roles','update');

    UPDATE user_roles SET
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE user_id = _user_id AND role_id = _role_id AND school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_user_role(
    _user_id BIGINT,_role_id BIGINT,_school_id BIGINT
) RETURNS SETOF user_roles AS $$
BEGIN
    PERFORM require_permission('user_roles','view');

    RETURN QUERY
    SELECT *
    FROM user_roles
    WHERE user_id = _user_id AND role_id = _role_id AND school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all roles for a user in a school)
CREATE OR REPLACE FUNCTION list_user_roles(_user_id BIGINT,_school_id BIGINT) RETURNS SETOF user_roles AS $$
BEGIN
    PERFORM require_permission('user_roles','view');

    RETURN QUERY
    SELECT *
    FROM user_roles
    WHERE user_id = _user_id AND school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active roles for a user in a school
CREATE OR REPLACE FUNCTION list_active_user_roles(_user_id BIGINT,_school_id BIGINT) RETURNS SETOF user_roles AS $$
BEGIN
    PERFORM require_permission('user_roles','view');

    RETURN QUERY
    SELECT *
    FROM user_roles
    WHERE user_id = _user_id AND school_id = _school_id AND is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List users by role in a school
CREATE OR REPLACE FUNCTION list_users_by_role_in_school(_role_id BIGINT,_school_id BIGINT) RETURNS SETOF user_roles AS $$
BEGIN
    PERFORM require_permission('user_roles','view');

    RETURN QUERY
    SELECT *
    FROM user_roles
    WHERE role_id = _role_id AND school_id = _school_id AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_user_roles_summary(_school_id BIGINT) RETURNS TABLE (
    total_mappings BIGINT,
    active_mappings BIGINT,
    deleted_mappings BIGINT
) AS $$
BEGIN
    PERFORM require_permission('user_roles','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_mappings,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_mappings,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_mappings
    FROM user_roles
    WHERE school_id = _school_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION assign_user_role(BIGINT, BIGINT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_role(BIGINT, BIGINT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_role(BIGINT, BIGINT, BIGINT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION select_user_role(BIGINT, BIGINT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_user_roles(BIGINT, BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_user_roles(BIGINT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_users_by_role_in_school(BIGINT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_user_roles_summary(BIGINT) TO authenticated;



-- ============================================
-- Bit X: user_permissions (Granular per-user, per-school with Enforcement + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS user_permissions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,          -- e.g. 'class_academics', students management', 'system', 'dashboard'
    resource VARCHAR(100) NOT NULL,        -- e.g. 'student_records', 'lesson_plans', 'analytics'
    action VARCHAR(50) NOT NULL,          -- e.g. 'view', 'insert', 'update', 'delete'
    permission_id BIGINT REFERENCES permissions(id) ON DELETE SET NULL,
    is_allowed BOOLEAN DEFAULT TRUE,      -- ✅ toggle per action
    is_active BOOLEAN DEFAULT TRUE,       -- ✅ lifecycle toggle
    revoked_at TIMESTAMPTZ,               -- ✅ when permission was revoked
    revoked_by BIGINT,                    -- ✅ who revoked it
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,     -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE (school_id, user_id, module, resource, action)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='user_permissions' AND policyname='user_permissions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY user_permissions_isolation ON user_permissions';
    END IF;
END$$;

CREATE POLICY user_permissions_isolation ON user_permissions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_permissions_school_user 
ON user_permissions(school_id, user_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_module_action 
ON user_permissions(module, action);

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- GRANT (with resource)
-- ============================================
CREATE OR REPLACE FUNCTION grant_user_permission(
    _user_id BIGINT, _school_id BIGINT, _module VARCHAR, _resource VARCHAR, _action VARCHAR
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('user_permissions','insert');

    INSERT INTO user_permissions (user_id, school_id, module, resource, action, is_allowed, is_active, created_by)
    VALUES (_user_id, _school_id, _module, _resource, _action, TRUE, TRUE, current_user_id())
    ON CONFLICT (school_id, user_id, module, resource, action) DO UPDATE
    SET is_allowed = TRUE,
        is_active = TRUE,
        revoked_at = NULL,
        revoked_by = NULL,
        updated_at = NOW(),
        updated_by = current_user_id(),
        is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REVOKE (with resource)
-- ============================================
CREATE OR REPLACE FUNCTION revoke_user_permission(
    _user_id BIGINT, _school_id BIGINT, _module VARCHAR, _resource VARCHAR, _action VARCHAR
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('user_permissions','delete');

    UPDATE user_permissions
    SET is_allowed = FALSE,
        is_active = FALSE,
        revoked_at = NOW(),
        revoked_by = current_user_id(),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND module = _module
      AND resource = _resource
      AND action = _action
      AND is_deleted = FALSE
      AND is_allowed = TRUE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SELECT wrapper (single record, with resource)
-- ============================================
CREATE OR REPLACE FUNCTION select_user_permission(
    _user_id BIGINT, _school_id BIGINT, _module VARCHAR, _resource VARCHAR, _action VARCHAR
) RETURNS SETOF user_permissions AS $$
BEGIN
    PERFORM require_permission('user_permissions','view');

    RETURN QUERY
    SELECT *
    FROM user_permissions
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND module = _module
      AND resource = _resource
      AND action = _action
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- LIST wrapper (all permissions for a user in a school)
-- ============================================
CREATE OR REPLACE FUNCTION list_user_permissions(_user_id BIGINT, _school_id BIGINT) RETURNS SETOF user_permissions AS $$
BEGIN
    PERFORM require_permission('user_permissions','view');

    RETURN QUERY
    SELECT *
    FROM user_permissions
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- List active permissions for a user in a school
-- ============================================
CREATE OR REPLACE FUNCTION list_active_user_permissions(_user_id BIGINT, _school_id BIGINT) RETURNS SETOF user_permissions AS $$
BEGIN
    PERFORM require_permission('user_permissions','view');

    RETURN QUERY
    SELECT *
    FROM user_permissions
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================

-- List permissions by module + resource
CREATE OR REPLACE FUNCTION list_user_permissions_by_module_resource(
    _user_id BIGINT, _school_id BIGINT, _module VARCHAR, _resource VARCHAR
) RETURNS SETOF user_permissions AS $$
BEGIN
    PERFORM require_permission('user_permissions','view');

    RETURN QUERY
    SELECT *
    FROM user_permissions
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND module = _module
      AND resource = _resource
      AND is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Report: summary counts
CREATE OR REPLACE FUNCTION report_user_permissions_summary(_school_id BIGINT) RETURNS TABLE (
    total_permissions BIGINT,
    active_permissions BIGINT,
    revoked_permissions BIGINT,
    deleted_permissions BIGINT
) AS $$
BEGIN
    PERFORM require_permission('user_permissions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_permissions,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_permissions,
           COUNT(*) FILTER (WHERE is_allowed = FALSE AND is_deleted = FALSE) AS revoked_permissions,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_permissions
    FROM user_permissions
    WHERE school_id = _school_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER trg_user_permissions_updated_at
BEFORE UPDATE ON user_permissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_permissions_audit ON user_permissions;
CREATE TRIGGER trg_user_permissions_audit
AFTER INSERT OR UPDATE OR DELETE ON user_permissions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON user_permissions TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION grant_user_permission(BIGINT,BIGINT,VARCHAR,VARCHAR,VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_permission(BIGINT,BIGINT,VARCHAR,VARCHAR,VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION select_user_permission(BIGINT,BIGINT,VARCHAR,VARCHAR,VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION list_user_permissions_by_module_resource(BIGINT,BIGINT,VARCHAR,VARCHAR) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_user_permissions(BIGINT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_user_permissions_summary(BIGINT) TO authenticated;

-- ============================================
-- Bit X/HR: departments (with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,          -- e.g. "Mathematics", "Finance", "Administration"
    code VARCHAR(20),                    -- short code
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,    -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='departments' AND policyname='departments_isolation'
    ) THEN
        EXECUTE 'DROP POLICY departments_isolation ON departments';
    END IF;
END$$;

CREATE POLICY departments_isolation ON departments
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_departments_school_name 
ON departments(school_id, name);

CREATE INDEX IF NOT EXISTS idx_departments_school_code 
ON departments(school_id, code);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_departments_audit ON departments;
CREATE TRIGGER trg_departments_audit
AFTER INSERT OR UPDATE OR DELETE ON departments
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_department(
    _name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('departments','insert');

    INSERT INTO departments (
        school_id,name,code,description,is_active,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_description,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_department(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('departments','update');

    UPDATE departments SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_department(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('departments','delete');

    UPDATE departments
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_department(_id BIGINT) RETURNS SETOF departments AS $$
BEGIN
    PERFORM require_permission('departments','view');

    RETURN QUERY
    SELECT *
    FROM departments
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_departments() RETURNS SETOF departments AS $$
BEGIN
    PERFORM require_permission('departments','view');

    RETURN QUERY
    SELECT *
    FROM departments
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active departments
CREATE OR REPLACE FUNCTION list_active_departments() RETURNS SETOF departments AS $$
BEGIN
    PERFORM require_permission('departments','view');

    RETURN QUERY
    SELECT *
    FROM departments
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_departments_summary() RETURNS TABLE (
    total_departments BIGINT,
    active_departments BIGINT,
    deleted_departments BIGINT
) AS $$
BEGIN
    PERFORM require_permission('departments','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_departments,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_departments,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_departments
    FROM departments
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON departments TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_department(TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_department(BIGINT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_department(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_department(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_departments() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_departments() TO authenticated;
GRANT EXECUTE ON FUNCTION report_departments_summary() TO authenticated;


-- ============================================
-- Bit X/HR: staffmgt_roles (with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS staffmgt_roles (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,          -- e.g. "Teacher", "Headmaster", "Accountant"
    code VARCHAR(20),                    -- short code
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,    -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE staffmgt_roles ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='staffmgt_roles' AND policyname='staffmgt_roles_isolation'
    ) THEN
        EXECUTE 'DROP POLICY staffmgt_roles_isolation ON staffmgt_roles';
    END IF;
END$$;

CREATE POLICY staffmgt_roles_isolation ON staffmgt_roles
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_staffmgt_roles_school_name 
ON staffmgt_roles(school_id, name);

CREATE INDEX IF NOT EXISTS idx_staffmgt_roles_school_code 
ON staffmgt_roles(school_id, code);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_staffmgt_roles_updated_at ON staffmgt_roles;
CREATE TRIGGER trg_staffmgt_roles_updated_at
BEFORE UPDATE ON staffmgt_roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_staffmgt_roles_audit ON staffmgt_roles;
CREATE TRIGGER trg_staffmgt_roles_audit
AFTER INSERT OR UPDATE OR DELETE ON staffmgt_roles
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_staffmgt_role(
    _name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('staffmgt_roles','insert');

    INSERT INTO staffmgt_roles (
        school_id,name,code,description,is_active,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_description,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_staffmgt_role(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staffmgt_roles','update');

    UPDATE staffmgt_roles SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_staffmgt_role(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staffmgt_roles','delete');

    UPDATE staffmgt_roles
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_staffmgt_role(_id BIGINT) RETURNS SETOF staffmgt_roles AS $$
BEGIN
    PERFORM require_permission('staffmgt_roles','view');

    RETURN QUERY
    SELECT *
    FROM staffmgt_roles
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_staffmgt_roles() RETURNS SETOF staffmgt_roles AS $$
BEGIN
    PERFORM require_permission('staffmgt_roles','view');

    RETURN QUERY
    SELECT *
    FROM staffmgt_roles
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active staffmgt_roles
CREATE OR REPLACE FUNCTION list_active_staffmgt_roles() RETURNS SETOF staffmgt_roles AS $$
BEGIN
    PERFORM require_permission('staffmgt_roles','view');

    RETURN QUERY
    SELECT *
    FROM staffmgt_roles
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_staffmgt_roles_summary() RETURNS TABLE (
    total_roles BIGINT,
    active_roles BIGINT,
    deleted_roles BIGINT
) AS $$
BEGIN
    PERFORM require_permission('staffmgt_roles','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_roles,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_roles,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_roles
    FROM staffmgt_roles
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON staffmgt_roles TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_staffmgt_role(TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_staffmgt_role(BIGINT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_staffmgt_role(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_staffmgt_role(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_staffmgt_roles() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_staffmgt_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION report_staffmgt_roles_summary() TO authenticated;



-- ============================================
-- Bit 1/18: staffmgt_(Unified staffmgt_Schema with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- link to users table
    employee_no VARCHAR(50),                -- optional staff number
    hire_date DATE DEFAULT CURRENT_DATE,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL, -- ✅ department link
    role_id BIGINT REFERENCES staffmgt_roles(id) ON DELETE SET NULL,       -- ✅ role link
    is_active BOOLEAN DEFAULT TRUE,         -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,       -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, user_id),
    UNIQUE(school_id, employee_no)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='staff' AND policyname='staffmgt_isolation'
    ) THEN
        EXECUTE 'DROP POLICY staffmgt_isolation ON staff';
    END IF;
END$$;

CREATE POLICY staffmgt_isolation ON staff
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_staffmgt_school_user ON staff(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_staffmgt_department ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staffmgt_role ON staff(role_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_staffmgt_updated_at ON staff;
CREATE TRIGGER trg_staffmgt_updated_at
BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_staffmgt_audit ON staff;
CREATE TRIGGER trg_staffmgt_audit
AFTER INSERT OR UPDATE OR DELETE ON staff
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_staff(
    _user_id BIGINT,_employee_no TEXT,_hire_date DATE,_department_id BIGINT,_role_id BIGINT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('staff','insert');

    INSERT INTO staff (
        school_id,user_id,employee_no,hire_date,department_id,role_id,is_active,created_by
    )
    VALUES (
        current_school_id(),_user_id,_employee_no,COALESCE(_hire_date,CURRENT_DATE),
        _department_id,_role_id,COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_staff(
    _id BIGINT,_employee_no TEXT,_hire_date DATE,_department_id BIGINT,_role_id BIGINT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff','update');

    UPDATE staff SET
        employee_no = COALESCE(_employee_no,employee_no),
        hire_date = COALESCE(_hire_date,hire_date),
        department_id = COALESCE(_department_id,department_id),
        role_id = COALESCE(_role_id,role_id),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_staff(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff','delete');

    UPDATE staff
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_staff(_id BIGINT) RETURNS SETOF staff AS $$
BEGIN
    PERFORM require_permission('staff','view');

    RETURN QUERY
    SELECT *
    FROM staff
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_staff() RETURNS SETOF staff AS $$
BEGIN
    PERFORM require_permission('staff','view');

    RETURN QUERY
    SELECT *
    FROM staff
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active staff for current school
CREATE OR REPLACE FUNCTION list_active_staff() RETURNS SETOF staff AS $$
BEGIN
    PERFORM require_permission('staff','view');

    RETURN QUERY
    SELECT *
    FROM staff
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List staff by department
CREATE OR REPLACE FUNCTION list_staffmgt_by_department(_department_id BIGINT) RETURNS SETOF staff AS $$
BEGIN
    PERFORM require_permission('staff','view');

    RETURN QUERY
    SELECT *
    FROM staff
    WHERE school_id = current_school_id()
      AND department_id = _department_id
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List staff by role
CREATE OR REPLACE FUNCTION list_staffmgt_by_role(_role_id BIGINT) RETURNS SETOF staff AS $$
BEGIN
    PERFORM require_permission('staff','view');

    RETURN QUERY
    SELECT *
    FROM staff
    WHERE school_id = current_school_id()
      AND role_id = _role_id
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_staffmgt_summary() RETURNS TABLE (
    total_staff BIGINT,
    active_staff BIGINT,
    deleted_staff BIGINT
) AS $$
BEGIN
    PERFORM require_permission('staff','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_staff,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_staff,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_staff
    FROM staff
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON staff TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_staff(BIGINT,TEXT,DATE,BIGINT,BIGINT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_staff(BIGINT,TEXT,DATE,BIGINT,BIGINT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_staff(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_staff(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_staff() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION list_staffmgt_by_department(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_staffmgt_by_role(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_staffmgt_summary() TO authenticated;

-- ============================================
-- Bit X: statuses (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS statuses (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    module VARCHAR(50) NOT NULL,   -- e.g. 'lesson','assignment','submission','exam','exam_result','report_card'
    code VARCHAR(50) NOT NULL,     -- internal code like 'planned','completed','cancelled'
    label VARCHAR(100) NOT NULL,   -- human-friendly label
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(module, code)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_statuses_module_code ON statuses(module, code);
CREATE INDEX IF NOT EXISTS idx_statuses_school_module ON statuses(school_id, module);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_statuses_updated_at ON statuses;
CREATE TRIGGER trg_statuses_updated_at
BEFORE UPDATE ON statuses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_statuses_audit ON statuses;
CREATE TRIGGER trg_statuses_audit
AFTER INSERT OR UPDATE OR DELETE ON statuses
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='statuses' AND policyname='statuses_isolation'
    ) THEN
        EXECUTE 'DROP POLICY statuses_isolation ON statuses';
    END IF;
END$$;

CREATE POLICY statuses_isolation ON statuses
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_status(
    _module TEXT,_code TEXT,_label TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('statuses','insert');

    INSERT INTO statuses (school_id,module,code,label,description,is_active,created_by)
    VALUES (current_school_id(),_module,_code,_label,_description,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_status(
    _id BIGINT,_label TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('statuses','update');

    UPDATE statuses SET
        label = COALESCE(_label,label),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_status(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('statuses','delete');

    UPDATE statuses
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_status(_id BIGINT) RETURNS SETOF statuses AS $$
BEGIN
    PERFORM require_permission('statuses','view');

    RETURN QUERY
    SELECT *
    FROM statuses
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for a module)
CREATE OR REPLACE FUNCTION list_statuses(_module TEXT) RETURNS SETOF statuses AS $$
BEGIN
    PERFORM require_permission('statuses','view');

    RETURN QUERY
    SELECT *
    FROM statuses
    WHERE module = _module AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active statuses for a module
CREATE OR REPLACE FUNCTION list_active_statuses(_module TEXT) RETURNS SETOF statuses AS $$
BEGIN
    PERFORM require_permission('statuses','view');

    RETURN QUERY
    SELECT *
    FROM statuses
    WHERE module = _module AND school_id = current_school_id()
      AND is_active = TRUE AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts per module
CREATE OR REPLACE FUNCTION report_statuses_summary(_module TEXT) RETURNS TABLE (
    total_statuses BIGINT,
    active_statuses BIGINT,
    deleted_statuses BIGINT
) AS $$
BEGIN
    PERFORM require_permission('statuses','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_statuses,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_statuses,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_statuses
    FROM statuses
    WHERE module = _module AND school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON statuses TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_status(TEXT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_status(BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_status(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_status(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_statuses(TEXT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_statuses(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_statuses_summary(TEXT) TO authenticated;


-- ============================================
-- Bit X: assessment_types (Lookup Table with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_types (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,   -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,          -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
) TABLESPACE pg_default;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assessment_types_code ON assessment_types(code);
CREATE INDEX IF NOT EXISTS idx_assessment_types_school ON assessment_types(school_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_assessment_types_updated_at ON assessment_types;
CREATE TRIGGER trg_assessment_types_updated_at
BEFORE UPDATE ON assessment_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_types_audit ON assessment_types;
CREATE TRIGGER trg_assessment_types_audit
AFTER INSERT OR UPDATE OR DELETE ON assessment_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE assessment_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='assessment_types' AND policyname='assessment_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assessment_types_isolation ON assessment_types';
    END IF;
END$$;

CREATE POLICY assessment_types_isolation ON assessment_types
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_assessment_type(
    _code TEXT,_label TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('assessment_types','insert');

    INSERT INTO assessment_types (school_id,code,label,description,is_active,created_by)
    VALUES (current_school_id(),_code,_label,_description,COALESCE(_is_active,TRUE),current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_assessment_type(
    _id BIGINT,_label TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assessment_types','update');

    UPDATE assessment_types SET
        label = COALESCE(_label,label),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_assessment_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assessment_types','delete');

    UPDATE assessment_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_assessment_type(_id BIGINT) RETURNS SETOF assessment_types AS $$
BEGIN
    PERFORM require_permission('assessment_types','view');

    RETURN QUERY
    SELECT *
    FROM assessment_types
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_assessment_types() RETURNS SETOF assessment_types AS $$
BEGIN
    PERFORM require_permission('assessment_types','view');

    RETURN QUERY
    SELECT *
    FROM assessment_types
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active assessment types
CREATE OR REPLACE FUNCTION list_active_assessment_types() RETURNS SETOF assessment_types AS $$
BEGIN
    PERFORM require_permission('assessment_types','view');

    RETURN QUERY
    SELECT *
    FROM assessment_types
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_assessment_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('assessment_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM assessment_types
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON assessment_types TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_assessment_type(TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_assessment_type(BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_assessment_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_assessment_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_assessment_types() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_assessment_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_assessment_types_summary() TO authenticated;


-- ============================================
-- Bit X/HR: staffmgt_promotions (with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS staffmgt_promotions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staffmgt_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    old_role_id BIGINT REFERENCES staffmgt_roles(id) ON DELETE SET NULL,
    new_role_id BIGINT REFERENCES staffmgt_roles(id) ON DELETE SET NULL,
    old_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    new_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    promotion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,    -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE staffmgt_promotions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='staffmgt_promotions' AND policyname='staffmgt_promotions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY staffmgt_promotions_isolation ON staffmgt_promotions';
    END IF;
END$$;

CREATE POLICY staffmgt_promotions_isolation ON staffmgt_promotions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_staffmgt_promotions_school_staff 
ON staffmgt_promotions(school_id, staffmgt_id);

CREATE INDEX IF NOT EXISTS idx_staffmgt_promotions_role_change 
ON staffmgt_promotions(old_role_id, new_role_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_staffmgt_promotions_updated_at ON staffmgt_promotions;
CREATE TRIGGER trg_staffmgt_promotions_updated_at
BEFORE UPDATE ON staffmgt_promotions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_staffmgt_promotions_audit ON staffmgt_promotions;
CREATE TRIGGER trg_staffmgt_promotions_audit
AFTER INSERT OR UPDATE OR DELETE ON staffmgt_promotions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_staffmgt_promotion(
    _staffmgt_id BIGINT,_old_role_id BIGINT,_new_role_id BIGINT,
    _old_department_id BIGINT,_new_department_id BIGINT,
    _promotion_date DATE,_remarks TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('staffmgt_promotions','insert');

    INSERT INTO staffmgt_promotions (
        school_id,staffmgt_id,old_role_id,new_role_id,old_department_id,new_department_id,
        promotion_date,remarks,is_active,created_by
    )
    VALUES (
        current_school_id(),_staffmgt_id,_old_role_id,_new_role_id,_old_department_id,_new_department_id,
        COALESCE(_promotion_date,CURRENT_DATE),_remarks,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_staffmgt_promotion(
    _id BIGINT,_old_role_id BIGINT,_new_role_id BIGINT,
    _old_department_id BIGINT,_new_department_id BIGINT,
    _promotion_date DATE,_remarks TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staffmgt_promotions','update');

    UPDATE staffmgt_promotions SET
        old_role_id = COALESCE(_old_role_id,old_role_id),
        new_role_id = COALESCE(_new_role_id,new_role_id),
        old_department_id = COALESCE(_old_department_id,old_department_id),
        new_department_id = COALESCE(_new_department_id,new_department_id),
        promotion_date = COALESCE(_promotion_date,promotion_date),
        remarks = COALESCE(_remarks,remarks),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_staffmgt_promotion(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staffmgt_promotions','delete');

    UPDATE staffmgt_promotions
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_staffmgt_promotion(_id BIGINT) RETURNS SETOF staffmgt_promotions AS $$
BEGIN
    PERFORM require_permission('staffmgt_promotions','view');

    RETURN QUERY
    SELECT *
    FROM staffmgt_promotions
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_staffmgt_promotions() RETURNS SETOF staffmgt_promotions AS $$
BEGIN
    PERFORM require_permission('staffmgt_promotions','view');

    RETURN QUERY
    SELECT *
    FROM staffmgt_promotions
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active staff promotions
CREATE OR REPLACE FUNCTION list_active_staffmgt_promotions() RETURNS SETOF staffmgt_promotions AS $$
BEGIN
    PERFORM require_permission('staffmgt_promotions','view');

    RETURN QUERY
    SELECT *
    FROM staffmgt_promotions
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_staffmgt_promotions_summary() RETURNS TABLE (
    total_promotions BIGINT,
    active_promotions BIGINT,
    deleted_promotions BIGINT
) AS $$
BEGIN
    PERFORM require_permission('staffmgt_promotions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_promotions,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_promotions,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_promotions
    FROM staffmgt_promotions
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON staffmgt_promotions TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_staffmgt_promotion(BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,DATE,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_staffmgt_promotion(BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,DATE,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_staffmgt_promotion(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_staffmgt_promotion(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_staffmgt_promotions() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_staffmgt_promotions() TO authenticated;
GRANT EXECUTE ON FUNCTION report_staffmgt_promotions_summary() TO authenticated;


-- ============================================
-- Staff Promotion History View
-- ============================================

CREATE OR REPLACE VIEW staffmgt_promotion_history_view AS
SELECT 
    sp.id AS id, -- Backend compatibility
    sp.id AS promotion_id,
    sp.school_id,
    s.id AS staffmgt_id,
    s.employee_no,
    s.user_id,
    s.hire_date,
    
    -- Old role/department with Fallbacks
    sp.old_role_id,
    COALESCE(sr_old.name, 'N/A') AS old_role_name,
    sp.old_department_id,
    COALESCE(d_old.name, 'N/A') AS old_department_name,
    
    -- New role/department with Fallbacks
    sp.new_role_id,
    COALESCE(sr_new.name, 'Unassigned') AS new_role_name,
    sp.new_department_id,
    COALESCE(d_new.name, 'Unassigned') AS new_department_name,
    
    -- Promotion details
    sp.promotion_date,
    COALESCE(sp.remarks, '') AS remarks,
    sp.is_active,
    sp.created_at,
    sp.created_by,
    sp.updated_at,
    sp.updated_by,
    sp.is_deleted,
    sp.deleted_at,
    sp.deleted_by
FROM staffmgt_promotions sp
JOIN staff s ON sp.staffmgt_id = s.id
LEFT JOIN staffmgt_roles sr_old ON sp.old_role_id = sr_old.id
LEFT JOIN staffmgt_roles sr_new ON sp.new_role_id = sr_new.id
LEFT JOIN departments d_old ON sp.old_department_id = d_old.id
LEFT JOIN departments d_new ON sp.new_department_id = d_new.id
WHERE sp.is_deleted = FALSE;

GRANT SELECT ON staffmgt_promotion_history_view TO authenticated;