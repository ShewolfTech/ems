-- ============================================
-- Bit 1/18: academic_years (Reconciled with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS academic_years (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date > start_date),
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE, -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='academic_years' AND policyname='academic_years_isolation'
    ) THEN
        EXECUTE 'DROP POLICY academic_years_isolation ON academic_years';
    END IF;
END$$;

CREATE POLICY academic_years_isolation ON academic_years
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_academic_years_school_name 
ON academic_years(school_id, name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_academic_years_updated_at ON academic_years;
CREATE TRIGGER trg_academic_years_updated_at
BEFORE UPDATE ON academic_years
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_academic_years_audit ON academic_years;
CREATE TRIGGER trg_academic_years_audit
AFTER INSERT OR UPDATE OR DELETE ON academic_years
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_academic_year(
    _name TEXT,_code TEXT,_start_date DATE,_end_date DATE,_is_current BOOLEAN,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('academic_years','insert');

    INSERT INTO academic_years (
        school_id,name,code,start_date,end_date,is_current,is_active,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_start_date,_end_date,
        COALESCE(_is_current,FALSE),COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_academic_year(
    _id BIGINT,_name TEXT,_code TEXT,_is_current BOOLEAN,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('academic_years','update');

    UPDATE academic_years SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        is_current = COALESCE(_is_current,is_current),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_academic_year(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('academic_years','delete');

    UPDATE academic_years
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_academic_year(_id BIGINT) RETURNS SETOF academic_years AS $$
BEGIN
    PERFORM require_permission('academic_years','view');

    RETURN QUERY
    SELECT *
    FROM academic_years
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_academic_years() RETURNS SETOF academic_years AS $$
BEGIN
    PERFORM require_permission('academic_years','view');

    RETURN QUERY
    SELECT *
    FROM academic_years
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active academic years
CREATE OR REPLACE FUNCTION list_active_academic_years() RETURNS SETOF academic_years AS $$
BEGIN
    PERFORM require_permission('academic_years','view');

    RETURN QUERY
    SELECT *
    FROM academic_years
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_academic_years_summary() RETURNS TABLE (
    total_years BIGINT,
    active_years BIGINT,
    deleted_years BIGINT
) AS $$
BEGIN
    PERFORM require_permission('academic_years','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_years,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_years,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_years
    FROM academic_years
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON academic_years TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_academic_year(TEXT,TEXT,DATE,DATE,BOOLEAN,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_academic_year(BIGINT,TEXT,TEXT,BOOLEAN,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_academic_year(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_academic_year(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_academic_years() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_academic_years() TO authenticated;
GRANT EXECUTE ON FUNCTION report_academic_years_summary() TO authenticated;


-- ============================================
-- Bit 2/18: terms (Reconciled with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS terms (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date > start_date),
    is_active BOOLEAN DEFAULT TRUE, -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, academic_year_id, name),
    UNIQUE(school_id, academic_year_id, code)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='terms' AND policyname='terms_isolation'
    ) THEN
        EXECUTE 'DROP POLICY terms_isolation ON terms';
    END IF;
END$$;

CREATE POLICY terms_isolation ON terms
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_terms_school_year_name 
ON terms(school_id, academic_year_id, name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_terms_updated_at ON terms;
CREATE TRIGGER trg_terms_updated_at
BEFORE UPDATE ON terms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_terms_audit ON terms;
CREATE TRIGGER trg_terms_audit
AFTER INSERT OR UPDATE OR DELETE ON terms
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_term(
    _academic_year_id BIGINT,_name TEXT,_code TEXT,_start_date DATE,_end_date DATE,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('terms','insert');

    INSERT INTO terms (
        school_id,academic_year_id,name,code,start_date,end_date,is_active,created_by
    )
    VALUES (
        current_school_id(),_academic_year_id,_name,_code,_start_date,_end_date,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_term(
    _id BIGINT,_academic_year_id BIGINT,_name TEXT,_code TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('terms','update');

    UPDATE terms SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() 
          AND academic_year_id = _academic_year_id 
          AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_term(_id BIGINT,_academic_year_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('terms','delete');

    UPDATE terms
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() 
          AND academic_year_id = _academic_year_id 
          AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_term(_id BIGINT,_academic_year_id BIGINT) RETURNS SETOF terms AS $$
BEGIN
    PERFORM require_permission('terms','view');

    RETURN QUERY
    SELECT *
    FROM terms
    WHERE id = _id AND school_id = current_school_id() 
          AND academic_year_id = _academic_year_id 
          AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school/year)
CREATE OR REPLACE FUNCTION list_terms(_academic_year_id BIGINT) RETURNS SETOF terms AS $$
BEGIN
    PERFORM require_permission('terms','view');

    RETURN QUERY
    SELECT *
    FROM terms
    WHERE school_id = current_school_id() 
      AND academic_year_id = _academic_year_id 
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active terms for a given academic year
CREATE OR REPLACE FUNCTION list_active_terms(_academic_year_id BIGINT) RETURNS SETOF terms AS $$
BEGIN
    PERFORM require_permission('terms','view');

    RETURN QUERY
    SELECT *
    FROM terms
    WHERE school_id = current_school_id()
      AND academic_year_id = _academic_year_id
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_terms_summary(_academic_year_id BIGINT) RETURNS TABLE (
    total_terms BIGINT,
    active_terms BIGINT,
    deleted_terms BIGINT
) AS $$
BEGIN
    PERFORM require_permission('terms','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_terms,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_terms,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_terms
    FROM terms
    WHERE school_id = current_school_id()
      AND academic_year_id = _academic_year_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON terms TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_term(BIGINT,TEXT,TEXT,DATE,DATE,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_term(BIGINT,BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_term(BIGINT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_term(BIGINT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_terms(BIGINT) TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_terms(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_terms_summary(BIGINT) TO authenticated;


-- ============================================
-- Bit 3/18: grade_levels (Reconciled with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS grade_levels (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    name VARCHAR(50) NOT NULL,          -- e.g. "Primary 1", "Grade 7"
    code VARCHAR(20),                   -- short code
    education_level VARCHAR(50),        -- e.g. "Nursery", "Primary", "Secondary"
    order_no INT NOT NULL,              -- ordering within school
    is_active BOOLEAN DEFAULT TRUE,     -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,   -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE grade_levels ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='grade_levels' AND policyname='grade_levels_isolation'
    ) THEN
        EXECUTE 'DROP POLICY grade_levels_isolation ON grade_levels';
    END IF;
END$$;

CREATE POLICY grade_levels_isolation ON grade_levels
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_grade_levels_school_name 
ON grade_levels(school_id, name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_grade_levels_updated_at ON grade_levels;
CREATE TRIGGER trg_grade_levels_updated_at
BEFORE UPDATE ON grade_levels
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_grade_levels_audit ON grade_levels;
CREATE TRIGGER trg_grade_levels_audit
AFTER INSERT OR UPDATE OR DELETE ON grade_levels
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_grade_level(
    _name TEXT,_code TEXT,_education_level TEXT,_order_no INT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('grade_levels','insert');

    INSERT INTO grade_levels (
        school_id,name,code,education_level,order_no,is_active,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_education_level,_order_no,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_grade_level(
    _id BIGINT,_name TEXT,_code TEXT,_education_level TEXT,_order_no INT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('grade_levels','update');

    UPDATE grade_levels SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        education_level = COALESCE(_education_level,education_level),
        order_no = COALESCE(_order_no,order_no),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_grade_level(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('grade_levels','delete');

    UPDATE grade_levels
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_grade_level(_id BIGINT) RETURNS SETOF grade_levels AS $$
BEGIN
    PERFORM require_permission('grade_levels','view');

    RETURN QUERY
    SELECT *
    FROM grade_levels
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_grade_levels() RETURNS SETOF grade_levels AS $$
BEGIN
    PERFORM require_permission('grade_levels','view');

    RETURN QUERY
    SELECT *
    FROM grade_levels
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active grade levels
CREATE OR REPLACE FUNCTION list_active_grade_levels() RETURNS SETOF grade_levels AS $$
BEGIN
    PERFORM require_permission('grade_levels','view');

    RETURN QUERY
    SELECT *
    FROM grade_levels
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_grade_levels_summary() RETURNS TABLE (
    total_levels BIGINT,
    active_levels BIGINT,
    deleted_levels BIGINT
) AS $$
BEGIN
    PERFORM require_permission('grade_levels','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_levels,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_levels,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_levels
    FROM grade_levels
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON grade_levels TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_grade_level(TEXT,TEXT,TEXT,INT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_grade_level(BIGINT,TEXT,TEXT,TEXT,INT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_grade_level(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_grade_level(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_grade_levels() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_grade_levels() TO authenticated;
GRANT EXECUTE ON FUNCTION report_grade_levels_summary() TO authenticated;



-- ============================================
-- Bit 4/18: subjects (Reconciled with Permissions + Reporting)
-- ============================================
-- NOTE: The subjects table has a direct curriculum_id FK to curricula table.
-- A curriculum_subjects junction table is NOT needed (unlike class_teachers which is 
-- a proper many-to-many junction). The curriculum_subjects types in kysely.generated.ts 
-- are phantom types from an earlier schema design and should be ignored.
-- ============================================

CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    curriculum_id BIGINT REFERENCES curricula(id) ON DELETE SET NULL,
    grade_level_id BIGINT REFERENCES grade_levels(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    subject_area VARCHAR(100),
    is_core BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, code)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='subjects' AND policyname='subjects_isolation'
    ) THEN
        EXECUTE 'DROP POLICY subjects_isolation ON subjects';
    END IF;
END$$;

CREATE POLICY subjects_isolation ON subjects
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subjects_school_name 
ON subjects(school_id, name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_subjects_updated_at ON subjects;
CREATE TRIGGER trg_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subjects_audit ON subjects;
CREATE TRIGGER trg_subjects_audit
AFTER INSERT OR UPDATE OR DELETE ON subjects
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_subject(
    _name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('subjects','insert');

    INSERT INTO subjects (
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
CREATE OR REPLACE FUNCTION update_subject(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('subjects','update');

    UPDATE subjects SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_subject(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('subjects','delete');

    UPDATE subjects
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_subject(_id BIGINT) RETURNS SETOF subjects AS $$
BEGIN
    PERFORM require_permission('subjects','view');

    RETURN QUERY
    SELECT *
    FROM subjects
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_subjects() RETURNS SETOF subjects AS $$
BEGIN
    PERFORM require_permission('subjects','view');

    RETURN QUERY
    SELECT *
    FROM subjects
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active subjects
CREATE OR REPLACE FUNCTION list_active_subjects() RETURNS SETOF subjects AS $$
BEGIN
    PERFORM require_permission('subjects','view');

    RETURN QUERY
    SELECT *
    FROM subjects
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_subjects_summary() RETURNS TABLE (
    total_subjects BIGINT,
    active_subjects BIGINT,
    deleted_subjects BIGINT
) AS $$
BEGIN
    PERFORM require_permission('subjects','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_subjects,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_subjects,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_subjects
    FROM subjects
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON subjects TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_subject(TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_subject(BIGINT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_subject(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_subject(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_subjects() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_subjects() TO authenticated;
GRANT EXECUTE ON FUNCTION report_subjects_summary() TO authenticated;


-- ============================================
-- Bit 5/18: curricula (Reconciled with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS curricula (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    name VARCHAR(100) NOT NULL,          -- e.g. "National Curriculum", "IB Program"
    code VARCHAR(20),                    -- short code like "NC", "IB"
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
ALTER TABLE curricula ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='curricula' AND policyname='curricula_isolation'
    ) THEN
        EXECUTE 'DROP POLICY curricula_isolation ON curricula';
    END IF;
END$$;

CREATE POLICY curricula_isolation ON curricula
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_curricula_school_name 
ON curricula(school_id, name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_curricula_updated_at ON curricula;
CREATE TRIGGER trg_curricula_updated_at
BEFORE UPDATE ON curricula
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_curricula_audit ON curricula;
CREATE TRIGGER trg_curricula_audit
AFTER INSERT OR UPDATE OR DELETE ON curricula
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_curriculum(
    _name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('curricula','insert');

    INSERT INTO curricula (
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
CREATE OR REPLACE FUNCTION update_curriculum(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('curricula','update');

    UPDATE curricula SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_curriculum(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('curricula','delete');

    UPDATE curricula
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_curriculum(_id BIGINT) RETURNS SETOF curricula AS $$
BEGIN
    PERFORM require_permission('curricula','view');

    RETURN QUERY
    SELECT *
    FROM curricula
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_curricula() RETURNS SETOF curricula AS $$
BEGIN
    PERFORM require_permission('curricula','view');

    RETURN QUERY
    SELECT *
    FROM curricula
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active curricula
CREATE OR REPLACE FUNCTION list_active_curricula() RETURNS SETOF curricula AS $$
BEGIN
    PERFORM require_permission('curricula','view');

    RETURN QUERY
    SELECT *
    FROM curricula
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_curricula_summary() RETURNS TABLE (
    total_curricula BIGINT,
    active_curricula BIGINT,
    deleted_curricula BIGINT
) AS $$
BEGIN
    PERFORM require_permission('curricula','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_curricula,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_curricula,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_curricula
    FROM curricula
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON curricula TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_curriculum(TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_curriculum(BIGINT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_curriculum(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_curriculum(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_curricula() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_curricula() TO authenticated;
GRANT EXECUTE ON FUNCTION report_curricula_summary() TO authenticated;


-- ============================================
-- Bit 7/18: classes (Reconciled with Permissions + Reporting)
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    grade_level_id BIGINT REFERENCES grade_levels(id) ON DELETE SET NULL,
    curriculum_id BIGINT REFERENCES curricula(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, code)
);
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='classes' AND policyname='classes_isolation'
    ) THEN
        EXECUTE 'DROP POLICY classes_isolation ON classes';
    END IF;
END$$;

CREATE POLICY classes_isolation ON classes
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_classes_school_grade 
ON classes(school_id, grade_level_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_classes_updated_at ON classes;
CREATE TRIGGER trg_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_classes_audit ON classes;
CREATE TRIGGER trg_classes_audit
AFTER INSERT OR UPDATE OR DELETE ON classes
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_class(
    _grade_level_id BIGINT,_curriculum_id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('classes','insert');

    INSERT INTO classes (
        school_id,grade_level_id,curriculum_id,name,code,description,is_active,created_by
    )
    VALUES (
        current_school_id(),_grade_level_id,_curriculum_id,_name,_code,_description,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_class(
    _id BIGINT,_grade_level_id BIGINT,_curriculum_id BIGINT,_name TEXT,_code TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('classes','update');

    UPDATE classes SET
        grade_level_id = COALESCE(_grade_level_id,grade_level_id),
        curriculum_id = COALESCE(_curriculum_id,curriculum_id),
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_class(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('classes','delete');

    UPDATE classes
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_class(_id BIGINT) RETURNS SETOF classes AS $$
BEGIN
    PERFORM require_permission('classes','view');

    RETURN QUERY
    SELECT *
    FROM classes
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_classes() RETURNS SETOF classes AS $$
BEGIN
    PERFORM require_permission('classes','view');

    RETURN QUERY
    SELECT *
    FROM classes
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active classes
CREATE OR REPLACE FUNCTION list_active_classes() RETURNS SETOF classes AS $$
BEGIN
    PERFORM require_permission('classes','view');

    RETURN QUERY
    SELECT *
    FROM classes
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_classes_summary() RETURNS TABLE (
    total_classes BIGINT,
    active_classes BIGINT,
    deleted_classes BIGINT
) AS $$
BEGIN
    PERFORM require_permission('classes','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_classes,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_classes,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_classes
    FROM classes
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON classes TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_class(BIGINT,BIGINT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_class(BIGINT,BIGINT,BIGINT,TEXT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_class(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_class(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_classes() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_classes() TO authenticated;
GRANT EXECUTE ON FUNCTION report_classes_summary() TO authenticated;


-- ============================================
-- Bit 8/18: class_students (Reconciled with Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS class_students (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,      -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,    -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, class_id, student_id)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='class_students' AND policyname='class_students_isolation'
    ) THEN
        EXECUTE 'DROP POLICY class_students_isolation ON class_students';
    END IF;
END$$;

CREATE POLICY class_students_isolation ON class_students
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_class_students_school_class 
ON class_students(school_id, class_id);

CREATE INDEX IF NOT EXISTS idx_class_students_student 
ON class_students(student_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_class_students_updated_at ON class_students;
CREATE TRIGGER trg_class_students_updated_at
BEFORE UPDATE ON class_students
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_class_students_audit ON class_students;
CREATE TRIGGER trg_class_students_audit
AFTER INSERT OR UPDATE OR DELETE ON class_students
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_class_student(
    _class_id BIGINT,_student_id BIGINT,_enrollment_date DATE,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('class_students','insert');

    INSERT INTO class_students (
        school_id,class_id,student_id,enrollment_date,is_active,created_by
    )
    VALUES (
        current_school_id(),_class_id,_student_id,
        COALESCE(_enrollment_date,CURRENT_DATE),
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_class_student(
    _id BIGINT,_class_id BIGINT,_student_id BIGINT,_enrollment_date DATE,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('class_students','update');

    UPDATE class_students SET
        class_id = COALESCE(_class_id,class_id),
        student_id = COALESCE(_student_id,student_id),
        enrollment_date = COALESCE(_enrollment_date,enrollment_date),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_class_student(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('class_students','delete');

    UPDATE class_students
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_class_student(_id BIGINT) RETURNS SETOF class_students AS $$
BEGIN
    PERFORM require_permission('class_students','view');

    RETURN QUERY
    SELECT *
    FROM class_students
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_class_students() RETURNS SETOF class_students AS $$
BEGIN
    PERFORM require_permission('class_students','view');

    RETURN QUERY
    SELECT *
    FROM class_students
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active class students
CREATE OR REPLACE FUNCTION list_active_class_students() RETURNS SETOF class_students AS $$
BEGIN
    PERFORM require_permission('class_students','view');

    RETURN QUERY
    SELECT *
    FROM class_students
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_class_students_summary() RETURNS TABLE (
    total_enrollments BIGINT,
    active_enrollments BIGINT,
    deleted_enrollments BIGINT
) AS $$
BEGIN
    PERFORM require_permission('class_students','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_enrollments,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_enrollments,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_enrollments
    FROM class_students
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON class_students TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_class_student(BIGINT,BIGINT,DATE,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_class_student(BIGINT,BIGINT,BIGINT,DATE,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_class_student(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_class_student(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_class_students() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_class_students() TO authenticated;
GRANT EXECUTE ON FUNCTION report_class_students_summary() TO authenticated;


-- ============================================
-- Bit 11/18: lessons (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS lessons (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    term_id BIGINT REFERENCES terms(id),                -- ✅ term linkage
    status_id BIGINT REFERENCES statuses(id),           -- ✅ normalized status
    title VARCHAR(150) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    resources JSONB,
    teacher_comments JSONB DEFAULT '{}'::JSONB,         -- ✅ optional remarks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);


-- ============================================
-- RLS
-- ============================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='lessons' AND policyname='lessons_isolation'
    ) THEN
        EXECUTE 'DROP POLICY lessons_isolation ON lessons';
    END IF;
END$$;

CREATE POLICY lessons_isolation ON lessons
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lessons_school_class_subject 
ON lessons(school_id, class_id, subject_id);

CREATE INDEX IF NOT EXISTS idx_lessons_school_teacher_date
ON lessons(school_id, teacher_id, scheduled_date);

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lessons_updated_at' AND tgrelid = 'lessons'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_lessons_updated_at ON lessons';
    END IF;
END$$;
CREATE TRIGGER trg_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lessons_audit' AND tgrelid = 'lessons'::regclass) THEN
        EXECUTE 'DROP TRIGGER trg_lessons_audit ON lessons';
    END IF;
END$$;
CREATE TRIGGER trg_lessons_audit
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_lesson(
    _class_id BIGINT,_subject_id BIGINT,_teacher_id BIGINT,
    _title TEXT,_description TEXT,_scheduled_date DATE,_start_time TIME,_end_time TIME,_resources JSONB,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('lessons','insert');

    INSERT INTO lessons (
        school_id,class_id,subject_id,teacher_id,title,description,scheduled_date,start_time,end_time,resources,is_active,created_by
    )
    VALUES (
        current_school_id(),_class_id,_subject_id,_teacher_id,_title,_description,_scheduled_date,_start_time,_end_time,_resources,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_lesson(
    _id BIGINT,_class_id BIGINT,_subject_id BIGINT,_teacher_id BIGINT,
    _title TEXT,_description TEXT,_scheduled_date DATE,_start_time TIME,_end_time TIME,_resources JSONB,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('lessons','update');

    UPDATE lessons SET
        class_id = COALESCE(_class_id,class_id),
        subject_id = COALESCE(_subject_id,subject_id),
        teacher_id = COALESCE(_teacher_id,teacher_id),
        title = COALESCE(_title,title),
        description = COALESCE(_description,description),
        scheduled_date = COALESCE(_scheduled_date,scheduled_date),
        start_time = COALESCE(_start_time,start_time),
        end_time = COALESCE(_end_time,end_time),
        resources = COALESCE(_resources,resources),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_lesson(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('lessons','delete');

    UPDATE lessons
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_lesson(_id BIGINT) RETURNS SETOF lessons AS $$
BEGIN
    PERFORM require_permission('lessons','view');

    RETURN QUERY
    SELECT *
    FROM lessons
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_lessons() RETURNS SETOF lessons AS $$
BEGIN
    PERFORM require_permission('lessons','view');

    RETURN QUERY
    SELECT *
    FROM lessons
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active lessons
CREATE OR REPLACE FUNCTION list_active_lessons() RETURNS SETOF lessons AS $$
BEGIN
    PERFORM require_permission('lessons','view');

    RETURN QUERY
    SELECT *
    FROM lessons
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_lessons_summary() RETURNS TABLE (
    total_lessons BIGINT,
    active_lessons BIGINT,
    deleted_lessons BIGINT
) AS $$
BEGIN
    PERFORM require_permission('lessons','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_lessons,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_lessons,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_lessons
    FROM lessons
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON lessons TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_lesson(BIGINT,BIGINT,BIGINT,TEXT,TEXT,DATE,TIME,TIME,JSONB,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_lesson(BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,DATE,TIME,TIME,JSONB,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_lesson(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_lesson(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_lessons() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_lessons() TO authenticated;
GRANT EXECUTE ON FUNCTION report_lessons_summary() TO authenticated;


-- ============================================
-- Bit 10/18: timetables (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS timetables (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,              -- e.g. "Term 1 Timetable"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,          -- lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,        -- soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, class_id, term_id, name)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='timetables' AND policyname='timetables_isolation'
    ) THEN
        EXECUTE 'DROP POLICY timetables_isolation ON timetables';
    END IF;
END$$;

CREATE POLICY timetables_isolation ON timetables
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_timetables_school_class_term 
ON timetables(school_id, class_id, term_id);

CREATE INDEX IF NOT EXISTS idx_timetables_class_term_active
ON timetables(class_id, term_id)
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_timetables_updated_at ON timetables;
CREATE TRIGGER trg_timetables_updated_at
BEFORE UPDATE ON timetables
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_timetables_audit ON timetables;
CREATE TRIGGER trg_timetables_audit
AFTER INSERT OR UPDATE OR DELETE ON timetables
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- Bit 12/18: timetable_entries
-- ============================================

CREATE TABLE IF NOT EXISTS timetable_entries (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    timetable_id BIGINT NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    subject_id BIGINT REFERENCES subjects(id) ON DELETE SET NULL,
    teacher_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    room VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- Prevent overlapping time slots for the same class/day
CREATE UNIQUE INDEX IF NOT EXISTS idx_timetable_entries_no_overlap
ON timetable_entries(timetable_id, day_of_week, start_time, end_time)
WHERE is_deleted = FALSE AND is_active = TRUE;

-- Prevent teacher double-booking across ALL timetables in the same school
CREATE UNIQUE INDEX IF NOT EXISTS idx_timetable_entries_teacher_no_overlap
ON timetable_entries(school_id, teacher_id, day_of_week, start_time, end_time)
WHERE is_deleted = FALSE AND is_active = TRUE AND teacher_id IS NOT NULL;

ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='timetable_entries' AND policyname='timetable_entries_isolation'
    ) THEN
        EXECUTE 'DROP POLICY timetable_entries_isolation ON timetable_entries';
    END IF;
END$$;

CREATE POLICY timetable_entries_isolation ON timetable_entries
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_timetable_entries_timetable ON timetable_entries(timetable_id, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_teacher ON timetable_entries(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_subject ON timetable_entries(school_id, subject_id);

DROP TRIGGER IF EXISTS trg_timetable_entries_updated_at ON timetable_entries;
CREATE TRIGGER trg_timetable_entries_updated_at
BEFORE UPDATE ON timetable_entries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_timetable_entries_audit ON timetable_entries;
CREATE TRIGGER trg_timetable_entries_audit
AFTER INSERT OR UPDATE OR DELETE ON timetable_entries
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_timetable(
    _class_id BIGINT,_term_id BIGINT,_name TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('timetables','insert');

    INSERT INTO timetables (
        school_id,class_id,term_id,name,description,is_active,created_by
    )
    VALUES (
        current_school_id(),_class_id,_term_id,_name,_description,
        COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_timetable(
    _id BIGINT,_class_id BIGINT,_term_id BIGINT,_name TEXT,_description TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('timetables','update');

    UPDATE timetables SET
        class_id = COALESCE(_class_id,class_id),
        term_id = COALESCE(_term_id,term_id),
        name = COALESCE(_name,name),
        description = COALESCE(_description,description),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_timetable(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('timetables','delete');

    UPDATE timetables
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_timetable(_id BIGINT) RETURNS SETOF timetables AS $$
BEGIN
    PERFORM require_permission('timetables','view');

    RETURN QUERY
    SELECT *
    FROM timetables
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_timetables() RETURNS SETOF timetables AS $$
BEGIN
    PERFORM require_permission('timetables','view');

    RETURN QUERY
    SELECT *
    FROM timetables
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active timetables
CREATE OR REPLACE FUNCTION list_active_timetables() RETURNS SETOF timetables AS $$
BEGIN
    PERFORM require_permission('timetables','view');

    RETURN QUERY
    SELECT *
    FROM timetables
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_timetables_summary() RETURNS TABLE (
    total_timetables BIGINT,
    active_timetables BIGINT,
    deleted_timetables BIGINT
) AS $$
BEGIN
    PERFORM require_permission('timetables','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_timetables,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_timetables,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_timetables
    FROM timetables
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON timetables TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_timetable(BIGINT,BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_timetable(BIGINT,BIGINT,BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_timetable(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_timetable(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_timetables() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_timetables() TO authenticated;
GRANT EXECUTE ON FUNCTION report_timetables_summary() TO authenticated;


-- ============================================
-- Bit 12/18: assessments (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS assessments (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    assessment_type_id BIGINT REFERENCES assessment_types(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    max_score NUMERIC(5,2) NOT NULL CHECK (max_score > 0),
    weight NUMERIC(5,2) DEFAULT 1.0,
    date DATE NOT NULL,
    status_id BIGINT REFERENCES statuses(id),               -- ✅ normalized status
    teacher_comments JSONB DEFAULT '{}'::JSONB,            -- ✅ structured remarks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, class_id, subject_id, term_id, title)
);


-- ============================================
-- RLS
-- ============================================
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='assessments' AND policyname='assessments_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assessments_isolation ON assessments';
    END IF;
END$$;

CREATE POLICY assessments_isolation ON assessments
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assessments_school_class_subject_term 
ON assessments(school_id, class_id, subject_id, term_id);

CREATE INDEX IF NOT EXISTS idx_assessments_school_date_active
ON assessments(school_id, date)
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_assessments_updated_at ON assessments;
CREATE TRIGGER trg_assessments_updated_at
BEFORE UPDATE ON assessments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assessments_audit ON assessments;
CREATE TRIGGER trg_assessments_audit
AFTER INSERT OR UPDATE OR DELETE ON assessments
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_assessment(
    _class_id BIGINT,_subject_id BIGINT,_term_id BIGINT,_assessment_type_id BIGINT,
    _title TEXT,_description TEXT,_max_score NUMERIC,_weight NUMERIC,_date DATE,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('assessments','insert');

    INSERT INTO assessments (
        school_id,class_id,subject_id,term_id,assessment_type_id,title,description,
        max_score,weight,date,is_active,created_by
    )
    VALUES (
        current_school_id(),_class_id,_subject_id,_term_id,_assessment_type_id,_title,_description,
        _max_score,COALESCE(_weight,1.0),_date,COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_assessment(
    _id BIGINT,_class_id BIGINT,_subject_id BIGINT,_term_id BIGINT,_assessment_type_id BIGINT,
    _title TEXT,_description TEXT,_max_score NUMERIC,_weight NUMERIC,_date DATE,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assessments','update');

    UPDATE assessments SET
        class_id = COALESCE(_class_id,class_id),
        subject_id = COALESCE(_subject_id,subject_id),
        term_id = COALESCE(_term_id,term_id),
        assessment_type_id = COALESCE(_assessment_type_id,assessment_type_id),
        title = COALESCE(_title,title),
        description = COALESCE(_description,description),
        max_score = COALESCE(_max_score,max_score),
        weight = COALESCE(_weight,weight),
        date = COALESCE(_date,date),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_assessment(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assessments','delete');

    UPDATE assessments
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_assessment(_id BIGINT) RETURNS SETOF assessments AS $$
BEGIN
    PERFORM require_permission('assessments','view');

    RETURN QUERY
    SELECT *
    FROM assessments
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_assessments() RETURNS SETOF assessments AS $$
BEGIN
    PERFORM require_permission('assessments','view');

    RETURN QUERY
    SELECT *
    FROM assessments
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active assessments
CREATE OR REPLACE FUNCTION list_active_assessments() RETURNS SETOF assessments AS $$
BEGIN
    PERFORM require_permission('assessments','view');

    RETURN QUERY
    SELECT *
    FROM assessments
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_assessments_summary() RETURNS TABLE (
    total_assessments BIGINT,
    active_assessments BIGINT,
    deleted_assessments BIGINT
) AS $$
BEGIN
    PERFORM require_permission('assessments','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_assessments,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_assessments,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_assessments
    FROM assessments
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT, INSERT, UPDATE ON assessments TO authenticated;

GRANT EXECUTE ON FUNCTION insert_assessment(
    BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,NUMERIC,NUMERIC,DATE,BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION update_assessment(
    BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,NUMERIC,NUMERIC,DATE,BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION soft_delete_assessment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_assessment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_assessments() TO authenticated;

GRANT EXECUTE ON FUNCTION list_active_assessments() TO authenticated;
GRANT EXECUTE ON FUNCTION report_assessments_summary() TO authenticated;


-- ============================================
-- Bit 13/18: assessment_results (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_results (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC(6,2) NOT NULL CHECK (score >= 0),
    grade_letter VARCHAR(5),
    grade_point NUMERIC(3,1),
    remarks TEXT,
    graded_by BIGINT REFERENCES staff(id) ON DELETE SET NULL, -- ✅ added
    is_final BOOLEAN DEFAULT FALSE,           -- lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,         -- soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, assessment_id, student_id)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='assessment_results' AND policyname='assessment_results_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assessment_results_isolation ON assessment_results';
    END IF;
END$$;

CREATE POLICY assessment_results_isolation ON assessment_results
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_student 
ON assessment_results(assessment_id, student_id);

CREATE INDEX IF NOT EXISTS idx_assessment_results_final
ON assessment_results(assessment_id)
WHERE is_final = TRUE AND is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_assessment_results_updated_at ON assessment_results;
CREATE TRIGGER trg_assessment_results_updated_at
BEFORE UPDATE ON assessment_results
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_results_audit ON assessment_results;
CREATE TRIGGER trg_assessment_results_audit
AFTER INSERT OR UPDATE OR DELETE ON assessment_results
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_assessment_result(
    _assessment_id BIGINT,_student_id BIGINT,_score NUMERIC,
    _grade_letter TEXT,_grade_point NUMERIC,_remarks TEXT,_graded_by BIGINT,_is_final BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('assessment_results','insert');

    INSERT INTO assessment_results (
        school_id,assessment_id,student_id,score,grade_letter,grade_point,remarks,graded_by,is_final,created_by
    )
    VALUES (
        current_school_id(),_assessment_id,_student_id,_score,_grade_letter,_grade_point,_remarks,_graded_by,
        COALESCE(_is_final,FALSE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_assessment_result(
    _id BIGINT,_score NUMERIC,_grade_letter TEXT,_grade_point NUMERIC,_remarks TEXT,_graded_by BIGINT,_is_final BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assessment_results','update');

    UPDATE assessment_results SET
        score = COALESCE(_score,score),
        grade_letter = COALESCE(_grade_letter,grade_letter),
        grade_point = COALESCE(_grade_point,grade_point),
        remarks = COALESCE(_remarks,remarks),
        graded_by = COALESCE(_graded_by,graded_by),
        is_final = COALESCE(_is_final,is_final),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_assessment_result(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assessment_results','delete');

    UPDATE assessment_results
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_assessment_result(_id BIGINT) RETURNS SETOF assessment_results AS $$
BEGIN
    PERFORM require_permission('assessment_results','view');

    RETURN QUERY
    SELECT *
    FROM assessment_results
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_assessment_results() RETURNS SETOF assessment_results AS $$
BEGIN
    PERFORM require_permission('assessment_results','view');

    RETURN QUERY
    SELECT *
    FROM assessment_results
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List final assessment results
CREATE OR REPLACE FUNCTION list_final_assessment_results(_assessment_id BIGINT) RETURNS SETOF assessment_results AS $$
BEGIN
    PERFORM require_permission('assessment_results','view');

    RETURN QUERY
    SELECT *
    FROM assessment_results
    WHERE school_id = current_school_id()
      AND assessment_id = _assessment_id
      AND is_final = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_assessment_results_summary(_assessment_id BIGINT) RETURNS TABLE (
    total_results BIGINT,
    final_results BIGINT,
    deleted_results BIGINT
) AS $$
BEGIN
    PERFORM require_permission('assessment_results','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_results,
           COUNT(*) FILTER (WHERE is_final = TRUE AND is_deleted = FALSE) AS final_results,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_results
    FROM assessment_results
    WHERE school_id = current_school_id()
      AND assessment_id = _assessment_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON assessment_results TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_assessment_result(BIGINT,BIGINT,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_assessment_result(BIGINT,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_assessment_result(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_assessment_result(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_assessment_results() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_final_assessment_results(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_assessment_results_summary(BIGINT) TO authenticated;

-- ============================================
-- Bit 14/18: assignments (Reconciled with staff, Permissions + Reporting)
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    max_score NUMERIC(5,2) NOT NULL CHECK (max_score > 0),
    status_id BIGINT REFERENCES statuses(id),              -- ✅ normalized status
    teacher_comments JSONB DEFAULT '{}'::JSONB,            -- ✅ flexible remarks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, class_id, subject_id, term_id, title)
);

-- RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignments_isolation ON assignments
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_assignments_updated_at ON assignments;
CREATE TRIGGER trg_assignments_updated_at
BEFORE UPDATE ON assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='assignments' AND policyname='assignments_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assignments_isolation ON assignments';
    END IF;
END$$;

CREATE POLICY assignments_isolation ON assignments
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assignments_school_class_subject_term 
ON assignments(school_id, class_id, subject_id, term_id);

CREATE INDEX IF NOT EXISTS idx_assignments_teacher_due_date
ON assignments(teacher_id, due_date)
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_assignments_updated_at ON assignments;
CREATE TRIGGER trg_assignments_updated_at
BEFORE UPDATE ON assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assignments_audit ON assignments;
CREATE TRIGGER trg_assignments_audit
AFTER INSERT OR UPDATE OR DELETE ON assignments
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_assignment(
    _class_id BIGINT,_subject_id BIGINT,_teacher_id BIGINT,_term_id BIGINT,
    _title TEXT,_description TEXT,_due_date DATE,_max_score NUMERIC,_status TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('assignments','insert');

    INSERT INTO assignments (
        school_id,class_id,subject_id,teacher_id,term_id,title,description,due_date,max_score,status,is_active,created_by
    )
    VALUES (
        current_school_id(),_class_id,_subject_id,_teacher_id,_term_id,_title,_description,_due_date,_max_score,
        COALESCE(_status,'assigned'),COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_assignment(
    _id BIGINT,_class_id BIGINT,_subject_id BIGINT,_teacher_id BIGINT,_term_id BIGINT,
    _title TEXT,_description TEXT,_due_date DATE,_max_score NUMERIC,_status TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assignments','update');

    UPDATE assignments SET
        class_id = COALESCE(_class_id,class_id),
        subject_id = COALESCE(_subject_id,subject_id),
        teacher_id = COALESCE(_teacher_id,teacher_id),
        term_id = COALESCE(_term_id,term_id),
        title = COALESCE(_title,title),
        description = COALESCE(_description,description),
        due_date = COALESCE(_due_date,due_date),
        max_score = COALESCE(_max_score,max_score),
        status = COALESCE(_status,status),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_assignment(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assignments','delete');

    UPDATE assignments
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_assignment(_id BIGINT) RETURNS SETOF assignments AS $$
BEGIN
    PERFORM require_permission('assignments','view');

    RETURN QUERY
    SELECT *
    FROM assignments
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_assignments() RETURNS SETOF assignments AS $$
BEGIN
    PERFORM require_permission('assignments','view');

    RETURN QUERY
    SELECT *
    FROM assignments
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active assignments
CREATE OR REPLACE FUNCTION list_active_assignments() RETURNS SETOF assignments AS $$
BEGIN
    PERFORM require_permission('assignments','view');

    RETURN QUERY
    SELECT *
    FROM assignments
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_assignments_summary() RETURNS TABLE (
    total_assignments BIGINT,
    active_assignments BIGINT,
    deleted_assignments BIGINT
) AS $$
BEGIN
    PERFORM require_permission('assignments','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_assignments,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_assignments,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_assignments
    FROM assignments
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT, INSERT, UPDATE ON assignments TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_assignment(
    BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,DATE,NUMERIC,TEXT,BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION update_assignment(
    BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,DATE,NUMERIC,TEXT,BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION soft_delete_assignment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_assignment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_assignments() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_assignments() TO authenticated;
GRANT EXECUTE ON FUNCTION report_assignments_summary() TO authenticated;


-- ============================================
-- Bit 15/18: assignment_submissions (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    content TEXT,
    file_url TEXT,
    score NUMERIC(6,2),
    grade_letter VARCHAR(5),
    grade_point NUMERIC(3,1),
    remarks TEXT,
    graded_by BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    status_id BIGINT REFERENCES statuses(id),              -- ✅ normalized status
    teacher_comments JSONB DEFAULT '{}'::JSONB,            -- ✅ flexible remarks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, assignment_id, student_id)
);

-- RLS
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignment_submissions_isolation ON assignment_submissions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_assignment_submissions_updated_at ON assignment_submissions;
CREATE TRIGGER trg_assignment_submissions_updated_at
BEFORE UPDATE ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================
-- RLS
-- ============================================
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='assignment_submissions' AND policyname='assignment_submissions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assignment_submissions_isolation ON assignment_submissions';
    END IF;
END$$;

CREATE POLICY assignment_submissions_isolation ON assignment_submissions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_student 
ON assignment_submissions(assignment_id, student_id);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_grader
ON assignment_submissions(assignment_id, graded_by)
WHERE is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_assignment_submissions_updated_at ON assignment_submissions;
CREATE TRIGGER trg_assignment_submissions_updated_at
BEFORE UPDATE ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_assignment_submissions_audit ON assignment_submissions;
CREATE TRIGGER trg_assignment_submissions_audit
AFTER INSERT OR UPDATE OR DELETE ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_assignment_submission(
    _assignment_id BIGINT,_student_id BIGINT,_submission_date TIMESTAMPTZ,
    _content TEXT,_file_url TEXT,_score NUMERIC,_grade_letter TEXT,_grade_point NUMERIC,
    _remarks TEXT,_graded_by BIGINT,_status TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('assignment_submissions','insert');

    INSERT INTO assignment_submissions (
        school_id,assignment_id,student_id,submission_date,content,file_url,score,
        grade_letter,grade_point,remarks,graded_by,status,is_active,created_by
    )
    VALUES (
        current_school_id(),_assignment_id,_student_id,COALESCE(_submission_date,NOW()),
        _content,_file_url,_score,_grade_letter,_grade_point,_remarks,_graded_by,
        COALESCE(_status,'submitted'),COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_assignment_submission(
    _id BIGINT,_submission_date TIMESTAMPTZ,_content TEXT,_file_url TEXT,_score NUMERIC,
    _grade_letter TEXT,_grade_point NUMERIC,_remarks TEXT,_graded_by BIGINT,_status TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assignment_submissions','update');

    UPDATE assignment_submissions SET
        submission_date = COALESCE(_submission_date,submission_date),
        content = COALESCE(_content,content),
        file_url = COALESCE(_file_url,file_url),
        score = COALESCE(_score,score),
        grade_letter = COALESCE(_grade_letter,grade_letter),
        grade_point = COALESCE(_grade_point,grade_point),
        remarks = COALESCE(_remarks,remarks),
        graded_by = COALESCE(_graded_by,graded_by),
        status = COALESCE(_status,status),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_assignment_submission(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('assignment_submissions','delete');

    UPDATE assignment_submissions
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_assignment_submission(_id BIGINT) RETURNS SETOF assignment_submissions AS $$
BEGIN
    PERFORM require_permission('assignment_submissions','view');

    RETURN QUERY
    SELECT *
    FROM assignment_submissions
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_assignment_submissions() RETURNS SETOF assignment_submissions AS $$
BEGIN
    PERFORM require_permission('assignment_submissions','view');

    RETURN QUERY
    SELECT *
    FROM assignment_submissions
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active assignment submissions
CREATE OR REPLACE FUNCTION list_active_assignment_submissions() RETURNS SETOF assignment_submissions AS $$
BEGIN
    PERFORM require_permission('assignment_submissions','view');

    RETURN QUERY
    SELECT *
    FROM assignment_submissions
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_assignment_submissions_summary(_assignment_id BIGINT) RETURNS TABLE (
    total_submissions BIGINT,
    graded_submissions BIGINT,
    deleted_submissions BIGINT
) AS $$
BEGIN
    PERFORM require_permission('assignment_submissions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_submissions,
           COUNT(*) FILTER (WHERE graded_by IS NOT NULL AND is_deleted = FALSE) AS graded_submissions,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_submissions
    FROM assignment_submissions
    WHERE school_id = current_school_id()
      AND assignment_id = _assignment_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON assignment_submissions TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_assignment_submission(BIGINT,BIGINT,TIMESTAMPTZ,TEXT,TEXT,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_assignment_submission(BIGINT,TIMESTAMPTZ,TEXT,TEXT,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_assignment_submission(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_assignment_submission(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_assignment_submissions() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_assignment_submissions() TO authenticated;
GRANT EXECUTE ON FUNCTION report_assignment_submissions_summary(BIGINT) TO authenticated;


-- ============================================
-- Bit 16/18: exams (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS exams (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    max_score NUMERIC(5,2) NOT NULL CHECK (max_score > 0),
    status_id BIGINT REFERENCES statuses(id),              -- ✅ normalized status
    teacher_comments JSONB DEFAULT '{}'::JSONB,            -- ✅ flexible remarks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, class_id, subject_id, term_id, title)
);

-- RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY exams_isolation ON exams
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_exams_updated_at ON exams;
CREATE TRIGGER trg_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_exams_school_class_subject_term_teacher 
ON exams(school_id, class_id, subject_id, term_id, teacher_id);

CREATE INDEX IF NOT EXISTS idx_exams_school_date_active
ON exams(school_id, exam_date)
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_exams_updated_at ON exams;
CREATE TRIGGER trg_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_exams_audit ON exams;
CREATE TRIGGER trg_exams_audit
AFTER INSERT OR UPDATE OR DELETE ON exams
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_exam(
    _class_id BIGINT,_subject_id BIGINT,_term_id BIGINT,_teacher_id BIGINT,
    _title TEXT,_description TEXT,_exam_date DATE,_start_time TIME,_end_time TIME,_max_score NUMERIC,_status TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('exams','insert');

    INSERT INTO exams (
        school_id,class_id,subject_id,term_id,teacher_id,title,description,exam_date,start_time,end_time,max_score,status,is_active,created_by
    )
    VALUES (
        current_school_id(),_class_id,_subject_id,_term_id,_teacher_id,_title,_description,_exam_date,_start_time,_end_time,_max_score,
        COALESCE(_status,'scheduled'),COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_exam(
    _id BIGINT,_class_id BIGINT,_subject_id BIGINT,_term_id BIGINT,_teacher_id BIGINT,
    _title TEXT,_description TEXT,_exam_date DATE,_start_time TIME,_end_time TIME,_max_score NUMERIC,_status TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('exams','update');

    UPDATE exams SET
        class_id = COALESCE(_class_id,class_id),
        subject_id = COALESCE(_subject_id,subject_id),
        term_id = COALESCE(_term_id,term_id),
        teacher_id = COALESCE(_teacher_id,teacher_id),
        title = COALESCE(_title,title),
        description = COALESCE(_description,description),
        exam_date = COALESCE(_exam_date,exam_date),
        start_time = COALESCE(_start_time,start_time),
        end_time = COALESCE(_end_time,end_time),
        max_score = COALESCE(_max_score,max_score),
        status = COALESCE(_status,status),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_exam(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('exams','delete');

    UPDATE exams
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_exam(_id BIGINT) RETURNS SETOF exams AS $$
BEGIN
    PERFORM require_permission('exams','view');

    RETURN QUERY
    SELECT *
    FROM exams
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_exams() RETURNS SETOF exams AS $$
BEGIN
    PERFORM require_permission('exams','view');

    RETURN QUERY
    SELECT *
    FROM exams
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active exams
CREATE OR REPLACE FUNCTION list_active_exams() RETURNS SETOF exams AS $$
BEGIN
    PERFORM require_permission('exams','view');

    RETURN QUERY
    SELECT *
    FROM exams
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_exams_summary() RETURNS TABLE (
    total_exams BIGINT,
    active_exams BIGINT,
    deleted_exams BIGINT
) AS $$
BEGIN
    PERFORM require_permission('exams','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_exams,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_exams,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_exams
    FROM exams
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT, INSERT, UPDATE ON exams TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_exam(
    BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,DATE,TIME,TIME,NUMERIC,TEXT,BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION update_exam(
    BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,DATE,TIME,TIME,NUMERIC,TEXT,BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION soft_delete_exam(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_exam(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_exams() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_exams() TO authenticated;
GRANT EXECUTE ON FUNCTION report_exams_summary() TO authenticated;


-- ============================================
-- Bit 17/18: exam_results (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS exam_results (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC(6,2) NOT NULL CHECK (score >= 0),
    grade_letter VARCHAR(5),
    grade_point NUMERIC(3,1),
    remarks TEXT,
    graded_by BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    status_id BIGINT REFERENCES statuses(id),              -- ✅ normalized status
    is_final BOOLEAN DEFAULT FALSE,
    teacher_comments JSONB DEFAULT '{}'::JSONB,            -- ✅ flexible remarks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, exam_id, student_id)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='exam_results' AND policyname='exam_results_isolation'
    ) THEN
        EXECUTE 'DROP POLICY exam_results_isolation ON exam_results';
    END IF;
END$$;

CREATE POLICY exam_results_isolation ON exam_results
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_exam_results_updated_at ON exam_results;
CREATE TRIGGER trg_exam_results_updated_at
BEFORE UPDATE ON exam_results
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_exam_results_audit ON exam_results;
CREATE TRIGGER trg_exam_results_audit
AFTER INSERT OR UPDATE OR DELETE ON exam_results
FOR EACH ROW EXECUTE FUNCTION log_audit();


-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_exam_result(
    _exam_id BIGINT,_student_id BIGINT,_score NUMERIC,_grade_letter TEXT,_grade_point NUMERIC,
    _remarks TEXT,_graded_by BIGINT,_status TEXT,_is_final BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('exam_results','insert');

    INSERT INTO exam_results (
        school_id,exam_id,student_id,score,grade_letter,grade_point,remarks,graded_by,status,is_final,created_by
    )
    VALUES (
        current_school_id(),_exam_id,_student_id,_score,_grade_letter,_grade_point,_remarks,_graded_by,
        COALESCE(_status,'draft'),COALESCE(_is_final,FALSE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_exam_result(
    _id BIGINT,_score NUMERIC,_grade_letter TEXT,_grade_point NUMERIC,_remarks TEXT,
    _graded_by BIGINT,_status TEXT,_is_final BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('exam_results','update');

    UPDATE exam_results SET
        score = COALESCE(_score,score),
        grade_letter = COALESCE(_grade_letter,grade_letter),
        grade_point = COALESCE(_grade_point,grade_point),
        remarks = COALESCE(_remarks,remarks),
        graded_by = COALESCE(_graded_by,graded_by),
        status = COALESCE(_status,status),
        is_final = COALESCE(_is_final,is_final),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_exam_result(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('exam_results','delete');

    UPDATE exam_results
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_exam_result(_id BIGINT) RETURNS SETOF exam_results AS $$
BEGIN
    PERFORM require_permission('exam_results','view');

    RETURN QUERY
    SELECT *
    FROM exam_results
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_exam_results() RETURNS SETOF exam_results AS $$
BEGIN
    PERFORM require_permission('exam_results','view');

    RETURN QUERY
    SELECT *
    FROM exam_results
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List final exam results
CREATE OR REPLACE FUNCTION list_final_exam_results(_exam_id BIGINT) RETURNS SETOF exam_results AS $$
BEGIN
    PERFORM require_permission('exam_results','view');

    RETURN QUERY
    SELECT *
    FROM exam_results
    WHERE school_id = current_school_id()
      AND exam_id = _exam_id
      AND is_final = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_exam_results_summary(_exam_id BIGINT) RETURNS TABLE (
    total_results BIGINT,
    final_results BIGINT,
    deleted_results BIGINT
) AS $$
BEGIN
    PERFORM require_permission('exam_results','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_results,
           COUNT(*) FILTER (WHERE is_final = TRUE AND is_deleted = FALSE) AS final_results,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_results
    FROM exam_results
    WHERE school_id = current_school_id()
      AND exam_id = _exam_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON exam_results TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_exam_result(BIGINT,BIGINT,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_exam_result(BIGINT,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_exam_result(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_exam_result(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_exam_results() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_final_exam_results(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_exam_results_summary(BIGINT) TO authenticated;


-- ============================================
-- Bit 18/18: student_promotions (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS student_promotions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    to_class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    from_grade_level_id BIGINT NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    to_grade_level_id BIGINT NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    promotion_date DATE DEFAULT NOW(),
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'promoted',     -- ✅ optional lifecycle status
    is_active BOOLEAN DEFAULT TRUE,           -- lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,         -- soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE student_promotions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='student_promotions' AND policyname='student_promotions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY student_promotions_isolation ON student_promotions';
    END IF;
END$$;

CREATE POLICY student_promotions_isolation ON student_promotions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_promotions_school_student 
ON student_promotions(school_id, student_id);

CREATE INDEX IF NOT EXISTS idx_student_promotions_year_grade
ON student_promotions(school_id, academic_year_id, to_grade_level_id)
WHERE is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_student_promotions_updated_at ON student_promotions;
CREATE TRIGGER trg_student_promotions_updated_at
BEFORE UPDATE ON student_promotions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_student_promotions_audit ON student_promotions;
CREATE TRIGGER trg_student_promotions_audit
AFTER INSERT OR UPDATE OR DELETE ON student_promotions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_student_promotion(
    _student_id BIGINT,_from_class_id BIGINT,_to_class_id BIGINT,
    _from_grade_level_id BIGINT,_to_grade_level_id BIGINT,_academic_year_id BIGINT,
    _remarks TEXT,_status TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('student_promotions','insert');

    INSERT INTO student_promotions (
        school_id,student_id,from_class_id,to_class_id,
        from_grade_level_id,to_grade_level_id,academic_year_id,
        remarks,status,is_active,created_by
    )
    VALUES (
        current_school_id(),_student_id,_from_class_id,_to_class_id,
        _from_grade_level_id,_to_grade_level_id,_academic_year_id,
        _remarks,COALESCE(_status,'promoted'),COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_student_promotion(
    _id BIGINT,_remarks TEXT,_status TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('student_promotions','update');

    UPDATE student_promotions SET
        remarks = COALESCE(_remarks,remarks),
        status = COALESCE(_status,status),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_student_promotion(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('student_promotions','delete');

    UPDATE student_promotions
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_student_promotion(_id BIGINT) RETURNS SETOF student_promotions AS $$
BEGIN
    PERFORM require_permission('student_promotions','view');

    RETURN QUERY
    SELECT *
    FROM student_promotions
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_student_promotions() RETURNS SETOF student_promotions AS $$
BEGIN
    PERFORM require_permission('student_promotions','view');

    RETURN QUERY
    SELECT *
    FROM student_promotions
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active student promotions
CREATE OR REPLACE FUNCTION list_active_student_promotions() RETURNS SETOF student_promotions AS $$
BEGIN
    PERFORM require_permission('student_promotions','view');

    RETURN QUERY
    SELECT *
    FROM student_promotions
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_student_promotions_summary() RETURNS TABLE (
    total_promotions BIGINT,
    active_promotions BIGINT,
    deleted_promotions BIGINT
) AS $$
BEGIN
    PERFORM require_permission('student_promotions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_promotions,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_promotions,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_promotions
    FROM student_promotions
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON student_promotions TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_student_promotion(BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_student_promotion(BIGINT,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_student_promotion(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_student_promotion(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_student_promotions() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_student_promotions() TO authenticated;
GRANT EXECUTE ON FUNCTION report_student_promotions_summary() TO authenticated;


-- ============================================
-- Bit 18/18: report_cards (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS report_cards (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    gpa NUMERIC(4,2),
    percentage NUMERIC(5,2),
    grade_letter VARCHAR(5),
    attendance_percentage NUMERIC(5,2),
    teacher_comments JSONB DEFAULT '{}'::JSONB,             -- ✅ structured remarks
    class_teacher_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    status_id BIGINT REFERENCES statuses(id),               -- ✅ normalized status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, student_id, term_id)
);


-- ============================================
-- RLS
-- ============================================
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='report_cards' AND policyname='report_cards_isolation'
    ) THEN
        EXECUTE 'DROP POLICY report_cards_isolation ON report_cards';
    END IF;
END$$;

CREATE POLICY report_cards_isolation ON report_cards
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_report_cards_school_student_term 
ON report_cards(school_id, student_id, term_id);

CREATE INDEX IF NOT EXISTS idx_report_cards_term_active
ON report_cards(term_id)
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_report_cards_updated_at ON report_cards;
CREATE TRIGGER trg_report_cards_updated_at
BEFORE UPDATE ON report_cards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_report_cards_audit ON report_cards;
CREATE TRIGGER trg_report_cards_audit
AFTER INSERT OR UPDATE OR DELETE ON report_cards
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_report_card(
    _student_id BIGINT,_term_id BIGINT,_gpa NUMERIC,_percentage NUMERIC,_grade_letter TEXT,
    _attendance_percentage NUMERIC,_teacher_comment TEXT,_class_teacher_id BIGINT,_status TEXT,_is_active BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('report_cards','insert');

    INSERT INTO report_cards (
        school_id,student_id,term_id,gpa,percentage,grade_letter,attendance_percentage,
        teacher_comment,class_teacher_id,status,is_active,created_by
    )
    VALUES (
        current_school_id(),_student_id,_term_id,_gpa,_percentage,_grade_letter,_attendance_percentage,
        _teacher_comment,_class_teacher_id,COALESCE(_status,'draft'),COALESCE(_is_active,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_report_card(
    _id BIGINT,_gpa NUMERIC,_percentage NUMERIC,_grade_letter TEXT,
    _attendance_percentage NUMERIC,_teacher_comment TEXT,_class_teacher_id BIGINT,_status TEXT,_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('report_cards','update');

    UPDATE report_cards SET
        gpa = COALESCE(_gpa,gpa),
        percentage = COALESCE(_percentage,percentage),
        grade_letter = COALESCE(_grade_letter,grade_letter),
        attendance_percentage = COALESCE(_attendance_percentage,attendance_percentage),
        teacher_comment = COALESCE(_teacher_comment,teacher_comment),
        class_teacher_id = COALESCE(_class_teacher_id,class_teacher_id),
        status = COALESCE(_status,status),
        is_active = COALESCE(_is_active,is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_report_card(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('report_cards','delete');

    UPDATE report_cards
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_report_card(_id BIGINT) RETURNS SETOF report_cards AS $$
BEGIN
    PERFORM require_permission('report_cards','view');

    RETURN QUERY
    SELECT *
    FROM report_cards
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_report_cards() RETURNS SETOF report_cards AS $$
BEGIN
    PERFORM require_permission('report_cards','view');

    RETURN QUERY
    SELECT *
    FROM report_cards
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active report cards
CREATE OR REPLACE FUNCTION list_active_report_cards() RETURNS SETOF report_cards AS $$
BEGIN
    PERFORM require_permission('report_cards','view');

    RETURN QUERY
    SELECT *
    FROM report_cards
    WHERE school_id = current_school_id()
      AND is_active = TRUE
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_report_cards_summary() RETURNS TABLE (
    total_report_cards BIGINT,
    active_report_cards BIGINT,
    deleted_report_cards BIGINT
) AS $$
BEGIN
    PERFORM require_permission('report_cards','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_report_cards,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_report_cards,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_report_cards
    FROM report_cards
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON report_cards TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_report_card(BIGINT,BIGINT,NUMERIC,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_report_card(BIGINT,NUMERIC,NUMERIC,TEXT,NUMERIC,TEXT,BIGINT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_report_card(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_report_card(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_report_cards() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_report_cards() TO authenticated;
GRANT EXECUTE ON FUNCTION report_report_cards_summary() TO authenticated;


-- ============================================
-- Attendance Summary (Reconciled with staff, Permissions + Reporting)
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_summary (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    term_id BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_days INTEGER NOT NULL CHECK (total_days >= 0),
    days_present INTEGER NOT NULL CHECK (days_present >= 0),
    attendance_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_days > 0 THEN (days_present::NUMERIC / total_days::NUMERIC) * 100 ELSE 0 END
    ) STORED,
    status VARCHAR(20) DEFAULT 'finalized',    -- ✅ lifecycle status
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,         -- soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, class_id, term_id, student_id)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE attendance_summary ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='attendance_summary' AND policyname='attendance_summary_isolation'
    ) THEN
        EXECUTE 'DROP POLICY attendance_summary_isolation ON attendance_summary';
    END IF;
END$$;

CREATE POLICY attendance_summary_isolation ON attendance_summary
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_summary_school_class_term_student 
ON attendance_summary(school_id, class_id, term_id, student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_summary_term_active
ON attendance_summary(term_id)
WHERE is_deleted = FALSE;

-- ============================================
-- Triggers (safe, idempotent)
-- ============================================
DROP TRIGGER IF EXISTS trg_attendance_summary_updated_at ON attendance_summary;
CREATE TRIGGER trg_attendance_summary_updated_at
BEFORE UPDATE ON attendance_summary
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_summary_audit ON attendance_summary;
CREATE TRIGGER trg_attendance_summary_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance_summary
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_attendance_summary(
    _class_id BIGINT,_term_id BIGINT,_student_id BIGINT,_total_days INTEGER,_days_present INTEGER,_status TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('attendance_summary','insert');

    INSERT INTO attendance_summary (
        school_id,class_id,term_id,student_id,total_days,days_present,status,created_by
    )
    VALUES (
        current_school_id(),_class_id,_term_id,_student_id,_total_days,_days_present,
        COALESCE(_status,'finalized'),current_user_id()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_attendance_summary(
    _id BIGINT,_total_days INTEGER,_days_present INTEGER,_status TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_summary','update');

    UPDATE attendance_summary SET
        total_days = COALESCE(_total_days,total_days),
        days_present = COALESCE(_days_present,days_present),
        status = COALESCE(_status,status),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_attendance_summary(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_summary','delete');

    UPDATE attendance_summary
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_attendance_summary(_id BIGINT) RETURNS SETOF attendance_summary AS $$
BEGIN
    PERFORM require_permission('attendance_summary','view');

    RETURN QUERY
    SELECT *
    FROM attendance_summary
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_attendance_summaries() RETURNS SETOF attendance_summary AS $$
BEGIN
    PERFORM require_permission('attendance_summary','view');

    RETURN QUERY
    SELECT *
    FROM attendance_summary
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List active attendance summaries
CREATE OR REPLACE FUNCTION list_active_attendance_summaries() RETURNS SETOF attendance_summary AS $$
BEGIN
    PERFORM require_permission('attendance_summary','view');

    RETURN QUERY
    SELECT *
    FROM attendance_summary
    WHERE school_id = current_school_id()
      AND is_deleted = FALSE
      AND status = 'finalized';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_attendance_summary_counts() RETURNS TABLE (
    total_records BIGINT,
    finalized_records BIGINT,
    deleted_records BIGINT
) AS $$
BEGIN
    PERFORM require_permission('attendance_summary','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_records,
           COUNT(*) FILTER (WHERE status = 'finalized' AND is_deleted = FALSE) AS finalized_records,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_records
    FROM attendance_summary
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON attendance_summary TO authenticated;

-- CRUD
GRANT EXECUTE ON FUNCTION insert_attendance_summary(BIGINT,BIGINT,BIGINT,INTEGER,INTEGER,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_attendance_summary(BIGINT,INTEGER,INTEGER,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_attendance_summary(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_attendance_summary(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_attendance_summaries() TO authenticated;

-- Reporting
GRANT EXECUTE ON FUNCTION list_active_attendance_summaries() TO authenticated;
GRANT EXECUTE ON FUNCTION report_attendance_summary_counts() TO authenticated;

-- ============================================
-- 📊 Consolidated Performance Indexes (Lifecycle + Multi-tenant aware)
-- ============================================

-- Assessment Results: student-centric lookups
CREATE INDEX IF NOT EXISTS idx_assessment_results_student_assessment
    ON assessment_results(student_id, assessment_id);

-- Multi-tenant optimized (school isolation)
CREATE INDEX IF NOT EXISTS idx_assessment_results_school_student_assessment
    ON assessment_results(school_id, student_id, assessment_id);

-- Lessons: fetching all lessons for a class on a given date
CREATE INDEX IF NOT EXISTS idx_lessons_class_date
    ON lessons(class_id, scheduled_date)
    WHERE is_deleted = FALSE;

-- Assignments per class and subject, ordered by due date
CREATE INDEX IF NOT EXISTS idx_assignments_class_subject_due
    ON assignments(class_id, subject_id, due_date)
    WHERE is_deleted = FALSE;

-- Active assignments by due date
CREATE INDEX IF NOT EXISTS idx_assignments_active_due
    ON assignments(due_date)
    WHERE is_active = TRUE AND is_deleted = FALSE;

-- Submissions per assignment
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment
    ON assignment_submissions(assignment_id)
    WHERE is_deleted = FALSE;

-- Submissions per student
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student
    ON assignment_submissions(student_id)
    WHERE is_deleted = FALSE;

-- Submissions by assignment and grader
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_grader
    ON assignment_submissions(assignment_id, graded_by)
    WHERE is_deleted = FALSE;

-- Timetable queries by class and term
CREATE INDEX IF NOT EXISTS idx_timetables_class_term
    ON timetables(class_id, term_id)
    WHERE is_deleted = FALSE;

-- Attendance lookups per student per term
CREATE INDEX IF NOT EXISTS idx_attendance_summary_student_term
    ON attendance_summary(student_id, term_id)
    WHERE is_deleted = FALSE;

-- Attendance summaries by term (active only)
CREATE INDEX IF NOT EXISTS idx_attendance_summary_term_active
    ON attendance_summary(term_id)
    WHERE is_deleted = FALSE;

-- Report Cards: student-term lookups
CREATE INDEX IF NOT EXISTS idx_report_cards_student_term
    ON report_cards(student_id, term_id)
    WHERE is_deleted = FALSE;

-- Exams: active exams by date
CREATE INDEX IF NOT EXISTS idx_exams_school_date_active
    ON exams(school_id, exam_date)
    WHERE is_active = TRUE AND is_deleted = FALSE;

-- Exam Results: finalized results
CREATE INDEX IF NOT EXISTS idx_exam_results_final
    ON exam_results(exam_id)
    WHERE is_final = TRUE AND is_deleted = FALSE;

-- Student Promotions: year/grade lookups
CREATE INDEX IF NOT EXISTS idx_student_promotions_year_grade
    ON student_promotions(school_id, academic_year_id, to_grade_level_id)
    WHERE is_deleted = FALSE;

-- Lookup tables
CREATE INDEX IF NOT EXISTS idx_statuses_module_code 
    ON statuses(module, code);

CREATE INDEX IF NOT EXISTS idx_assessment_types_code 
    ON assessment_types(code);

-- 🛡️ Recommended Enums
-- ============================================
-- Enums for Consistency (Reconciled with staff)

-- Assessments
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS assessment_type_id BIGINT REFERENCES assessment_types(id);

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS academic_year_id BIGINT REFERENCES academic_years(id);

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS teacher_id BIGINT REFERENCES staff(id); -- ✅ fixed

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS status_id BIGINT REFERENCES statuses(id);

-- Lessons
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS term_id BIGINT REFERENCES terms(id);
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS room VARCHAR(50);

-- Classes
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS class_teacher_id BIGINT REFERENCES staff(id); -- ✅ fixed

/*
-- 📝 Consolidated Backfill Scripts
-- Lessons
UPDATE lessons l
SET status_id = s.id
FROM statuses s
WHERE s.module = 'lesson'
  AND s.code = l.status
  AND l.status_id IS NULL;

-- Assignments
UPDATE assignments a
SET status_id = s.id
FROM statuses s
WHERE s.module = 'assignment'
  AND s.code = a.status
  AND a.status_id IS NULL;

-- Assignment Submissions
UPDATE assignment_submissions sub
SET status_id = s.id
FROM statuses s
WHERE s.module = 'submission'
  AND s.code = sub.status
  AND sub.status_id IS NULL;

-- Exams
UPDATE exams e
SET status_id = s.id
FROM statuses s
WHERE s.module = 'exam'
  AND s.code = e.status
  AND e.status_id IS NULL;

-- Exam Results
UPDATE exam_results er
SET status_id = s.id
FROM statuses s
WHERE s.module = 'exam_result'
  AND s.code = er.status
  AND er.status_id IS NULL;

-- Report Cards
UPDATE report_cards rc
SET status_id = s.id
FROM statuses s
WHERE s.module = 'report_card'
  AND s.code = rc.status
  AND rc.status_id IS NULL;

-- Assessments
UPDATE assessments a
SET status_id = s.id
FROM statuses s
WHERE s.module = 'assessment'
  AND s.code = a.status
  AND a.status_id IS NULL;

*/

-- 📊 Recommended Reporting Views
-- ============================================
-- Reporting Views
-- ============================================

-- Ensure FK columns exist
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessment_type_id BIGINT REFERENCES assessment_types(id);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS status_id BIGINT REFERENCES statuses(id);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS academic_year_id BIGINT REFERENCES academic_years(id);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS teacher_id BIGINT REFERENCES staff(id);
ALTER TABLE assessment_results ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- ============================================
-- Retrofit teacher_comments JSONB across result tables
-- ============================================

-- Assessments
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS teacher_comments JSONB DEFAULT '{}'::JSONB;

-- Exams
ALTER TABLE exam_results
ADD COLUMN IF NOT EXISTS teacher_comments JSONB DEFAULT '{}'::JSONB;

-- Assignments
ALTER TABLE assignment_submissions
ADD COLUMN IF NOT EXISTS teacher_comments JSONB DEFAULT '{}'::JSONB;

-- Attendance (optional, if you want remarks on attendance)
ALTER TABLE attendance_summary
ADD COLUMN IF NOT EXISTS teacher_comments JSONB DEFAULT '{}'::JSONB;

-- ============================================
-- VIEWS  - Academics (Improved with JSONB comments)
-- ============================================

-- ============================================
-- 1. Student Grades View (Refined)
-- ============================================
DROP VIEW IF EXISTS academics_studentsgrades_view;
CREATE VIEW academics_studentsgrades_view AS
SELECT
    ar.id::INT AS "id",
    ar.student_id::INT AS "studentId",
    COALESCE(stu.first_name || ' ' || stu.last_name, 'N/A') AS "studentName",
    ar.assessment_id::INT AS "assessmentId",
    COALESCE(a.title, 'N/A') AS "assessmentTitle",
    COALESCE(at.label, 'N/A') AS "assessmentType",
    a.date AS "assessmentDate",
    COALESCE(a.max_score, 0)::FLOAT AS "maxScore",
    COALESCE(ar.score, 0)::FLOAT AS "score",
    COALESCE(ar.grade_letter, '-') AS "gradeLetter",
    COALESCE(ar.grade_point, 0)::FLOAT AS "gradePoint",
    COALESCE(ar.remarks, '') AS "remarks",
    COALESCE(ar.teacher_comments->>'general','No comment') AS "teacherComment",
    COALESCE(c.name, 'N/A') AS "className",
    COALESCE(subj.name, 'N/A') AS "subjectName",
    COALESCE(gl.name, 'N/A') AS "gradeLevel",
    COALESCE(ay.name, 'N/A') AS "academicYear",
    COALESCE(t.name, 'N/A') AS "termName",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "teacherName",
    COALESCE(st.label, 'N/A') AS "assessmentStatus",
    stu.school_id::INT AS "schoolId"
FROM assessment_results ar
JOIN assessments a ON ar.assessment_id = a.id
JOIN assessment_types at ON a.assessment_type_id = at.id
JOIN students stu ON ar.student_id = stu.id
JOIN classes c ON a.class_id = c.id
JOIN grade_levels gl ON c.grade_level_id = gl.id
JOIN academic_years ay ON a.academic_year_id = ay.id
JOIN subjects subj ON a.subject_id = subj.id
LEFT JOIN terms t ON a.term_id = t.id
LEFT JOIN staff stf ON a.teacher_id = stf.id
LEFT JOIN users u ON stf.user_id = u.id
LEFT JOIN statuses st ON a.status_id = st.id 
WHERE ar.is_deleted = FALSE AND a.is_deleted = FALSE AND ar.is_active = TRUE AND a.is_active = TRUE;

-- ============================================
-- 2. Class Schedule View (Refined)
-- ============================================
DROP VIEW IF EXISTS academics_classschedule_view;
CREATE VIEW academics_classschedule_view AS
SELECT
    l.id::INT AS "id",
    tt.id::INT AS "timetableId",
    c.school_id::INT AS "schoolId",
    tt.class_id::INT AS "classId",
    COALESCE(c.name, 'N/A') AS "className",
    tt.term_id::INT AS "termId",
    COALESCE(t.name, 'N/A') AS "termName",
    COALESCE(tt.name, 'N/A') AS "timetableName",
    l.id::INT AS "lessonId",
    COALESCE(l.title, 'N/A') AS "lessonTitle",
    l.scheduled_date AS "scheduledDate",
    l.start_time AS "startTime",
    l.end_time AS "endTime",
    COALESCE(s.label, 'N/A') AS "lessonStatus",
    COALESCE(subj.name, 'N/A') AS "subjectName",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "teacherName",
    COALESCE(l.teacher_comments->>'general','No comment') AS "teacherComment"
FROM timetables tt
JOIN classes c ON tt.class_id = c.id
JOIN lessons l ON l.class_id = tt.class_id AND l.term_id = tt.term_id
JOIN subjects subj ON l.subject_id = subj.id
JOIN staff st ON l.teacher_id = st.id
JOIN users u ON st.user_id = u.id
LEFT JOIN terms t ON tt.term_id = t.id
LEFT JOIN statuses s ON l.status_id = s.id
WHERE tt.is_deleted = FALSE AND l.is_deleted = FALSE AND tt.is_active = TRUE AND l.is_active = TRUE;

-- ============================================
-- 3. Assignment Submissions View (Refined)
-- ============================================
DROP VIEW IF EXISTS academics_assignment_submissions_view;
CREATE VIEW academics_assignment_submissions_view AS
SELECT
    sub.id::INT AS "id",
    sub.assignment_id::INT AS "assignmentId",
    a.school_id::INT AS "schoolId", 
    COALESCE(a.title, 'N/A') AS "assignmentTitle",
    a.due_date AS "dueDate",
    a.class_id::INT AS "classId",
    COALESCE(c.name, 'N/A') AS "className",
    a.subject_id::INT AS "subjectId",
    COALESCE(subj.name, 'N/A') AS "subjectName",
    a.term_id::INT AS "termId",
    COALESCE(t.name, 'N/A') AS "termName",
    sub.student_id::INT AS "studentId",
    COALESCE(stu.first_name || ' ' || stu.last_name, 'N/A') AS "studentName",
    sub.submission_date AS "submissionDate",
    COALESCE(s.label, 'N/A') AS "submissionStatus", 
    COALESCE(sub.score, 0)::FLOAT AS "score",
    COALESCE(sub.grade_letter, '-') AS "gradeLetter",
    COALESCE(sub.grade_point, 0)::FLOAT AS "gradePoint",
    COALESCE(sub.remarks, '') AS "remarks",
    COALESCE(sub.teacher_comments->>'general','No comment') AS "teacherComment",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "gradedBy",
    sub.updated_at AS "gradedOn"
FROM assignment_submissions sub
JOIN assignments a ON sub.assignment_id = a.id
JOIN students stu ON sub.student_id = stu.id
JOIN classes c ON a.class_id = c.id
JOIN subjects subj ON a.subject_id = subj.id
LEFT JOIN terms t ON a.term_id = t.id
LEFT JOIN staff st ON sub.graded_by = st.id
LEFT JOIN users u ON st.user_id = u.id
LEFT JOIN statuses s ON sub.status_id = s.id
WHERE sub.is_deleted = FALSE AND a.is_deleted = FALSE AND sub.is_active = TRUE AND a.is_active = TRUE;

-- ============================================
-- 4. Teacher Workload View (Optimized with Subqueries)
-- ============================================
DROP VIEW IF EXISTS staffmgt_teacherworkload_view;
CREATE VIEW staffmgt_teacherworkload_view AS
SELECT
    st.id::INT AS "id",
    st.id::INT AS "teacherId",
    st.school_id::INT AS "schoolId",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "teacherName",
    -- Using scalar subqueries prevents Cartesian product row duplication
    (SELECT COUNT(DISTINCT class_id) FROM lessons WHERE teacher_id = st.id AND is_deleted = FALSE)::INT AS "totalClasses",
    (SELECT COUNT(DISTINCT subject_id) FROM lessons WHERE teacher_id = st.id AND is_deleted = FALSE)::INT AS "totalSubjects",
    (SELECT COUNT(*) FROM lessons WHERE teacher_id = st.id AND is_deleted = FALSE AND is_active = TRUE)::INT AS "totalLessons",
    (SELECT COUNT(*) FROM assessments WHERE teacher_id = st.id AND is_deleted = FALSE AND is_active = TRUE)::INT AS "totalAssessments",
    (SELECT COUNT(DISTINCT cs.student_id) 
     FROM class_students cs 
     JOIN classes c ON cs.class_id = c.id 
     JOIN lessons l ON l.class_id = c.id 
     WHERE l.teacher_id = st.id AND cs.is_deleted = FALSE AND l.is_deleted = FALSE)::INT AS "totalStudents"
FROM staff st
JOIN users u ON st.user_id = u.id
WHERE st.is_deleted = FALSE AND st.is_active = TRUE AND u.is_deleted = FALSE;

-- ============================================
-- 5. Student Term Performance View (Bulletproof Math)
-- ============================================
DROP VIEW IF EXISTS academics_studentterm_performance_view;
CREATE VIEW academics_studentterm_performance_view AS
SELECT
    (stu.id || '-' || t.id)::VARCHAR(50) AS "id",
    stu.id::INT AS "studentId",
    stu.school_id::INT AS "schoolId",
    COALESCE(stu.first_name || ' ' || stu.last_name, 'N/A') AS "studentName",
    t.id::INT AS "termId",
    COALESCE(t.name, 'N/A') AS "termName",
    COALESCE(ay.name, 'N/A') AS "academicYear",
    COALESCE(gl.name, 'N/A') AS "gradeLevel",
    COALESCE(c.name, 'N/A') AS "className",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "classTeacherName",
    COUNT(DISTINCT a.id)::INT AS "totalAssessments",
    SUM(COALESCE(ar.score,0))::FLOAT AS "totalScore",
    SUM(COALESCE(a.max_score,0))::FLOAT AS "totalMaxScore",
    -- Safe division with Coalesce fallback
    COALESCE(ROUND(CAST(SUM(COALESCE(ar.score,0)) AS NUMERIC) / NULLIF(SUM(COALESCE(a.max_score,0)),0) * 100, 2), 0)::FLOAT AS "percentage",
    COALESCE(MAX(ar.grade_letter) FILTER (WHERE ar.is_final = TRUE), 'N/A') AS "finalGradeLetter",
    COALESCE(MAX(ar.grade_point) FILTER (WHERE ar.is_final = TRUE), 0)::FLOAT AS "finalGradePoint",
    COALESCE(MAX(ar.teacher_comments->>'general'),'No comment') AS "teacherComment",
    COALESCE(att.attendance_percentage, 0)::FLOAT AS "attendancePercentage",
    COALESCE(s2.label, 'N/A') AS "assessmentStatus",
    COALESCE(sp.status, 'N/A') AS "promotionStatus",
    sp.promotion_date AS "promotionDate"
FROM assessment_results ar
JOIN assessments a ON ar.assessment_id = a.id
JOIN students stu ON ar.student_id = stu.id
JOIN classes c ON a.class_id = c.id
JOIN grade_levels gl ON c.grade_level_id = gl.id
JOIN terms t ON a.term_id = t.id
JOIN academic_years ay ON t.academic_year_id = ay.id
LEFT JOIN staff st ON c.class_teacher_id = st.id
LEFT JOIN users u ON st.user_id = u.id
LEFT JOIN attendance_summary att ON att.class_id = c.id AND att.term_id = t.id AND att.student_id = stu.id AND att.is_deleted = FALSE
LEFT JOIN statuses s2 ON a.status_id = s2.id
LEFT JOIN student_promotions sp ON sp.student_id = stu.id AND sp.academic_year_id = ay.id AND sp.is_deleted = FALSE
WHERE ar.is_deleted = FALSE AND a.is_deleted = FALSE AND ar.is_active = TRUE AND a.is_active = TRUE
GROUP BY stu.id, t.id, stu.school_id, stu.first_name, stu.last_name, t.name, ay.name, gl.name, c.name, u.first_name, u.last_name, att.attendance_percentage, s2.label, sp.status, sp.promotion_date;

-- ============================================
-- 6. Exam Performance View
-- ============================================
DROP VIEW IF EXISTS academics_exams_performance_view;
CREATE VIEW academics_exams_performance_view AS
SELECT
    er.id::INT AS "id",
    er.student_id::INT AS "studentId",
    e.school_id::INT AS "schoolId",
    COALESCE(stu.first_name || ' ' || stu.last_name, 'N/A') AS "studentName",
    e.id::INT AS "examId",
    COALESCE(e.title, 'N/A') AS "examTitle",
    COALESCE(subj.name, 'N/A') AS "subjectName",
    COALESCE(c.name, 'N/A') AS "className",
    t.id::INT AS "termId",
    COALESCE(t.name, 'N/A') AS "termName",
    COALESCE(ay.name, 'N/A') AS "academicYear",
    e.exam_date AS "examDate",
    COALESCE(e.max_score, 0)::FLOAT AS "maxScore",
    COALESCE(er.score, 0)::FLOAT AS "score",
    COALESCE(er.grade_letter, '-') AS "gradeLetter",
    COALESCE(er.grade_point, 0)::FLOAT AS "gradePoint",
    COALESCE(er.remarks, '') AS "remarks",
    COALESCE(st.label, 'N/A') AS "examStatus",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "teacherName"
FROM exam_results er
JOIN exams e ON er.exam_id = e.id
JOIN students stu ON er.student_id = stu.id
JOIN classes c ON e.class_id = c.id
JOIN subjects subj ON e.subject_id = subj.id
JOIN terms t ON e.term_id = t.id
JOIN academic_years ay ON t.academic_year_id = ay.id
LEFT JOIN staff stf ON e.teacher_id = stf.id
LEFT JOIN users u ON stf.user_id = u.id
LEFT JOIN statuses st ON e.status_id = st.id 
WHERE er.is_deleted = FALSE AND e.is_deleted = FALSE AND er.is_active = TRUE AND e.is_active = TRUE;

-- ============================================
-- 7. Exam Performance Summary View (Optimized Math)
-- ============================================
DROP VIEW IF EXISTS academics_exams_performance_summary_view;
CREATE VIEW academics_exams_performance_summary_view AS
SELECT
    e.id::INT AS "id",
    e.id::INT AS "examId",
    e.school_id::INT AS "schoolId",
    COALESCE(e.title, 'N/A') AS "examTitle",
    subj.id::INT AS "subjectId",
    COALESCE(subj.name, 'N/A') AS "subjectName",
    c.id::INT AS "classId",
    COALESCE(c.name, 'N/A') AS "className",
    t.id::INT AS "termId",
    COALESCE(t.name, 'N/A') AS "termName",
    COALESCE(ay.name, 'N/A') AS "academicYear",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "teacherName",
    COUNT(DISTINCT er.student_id)::INT AS "totalStudents",
    COALESCE(ROUND(CAST(SUM(COALESCE(er.score,0)) AS NUMERIC) / NULLIF(SUM(COALESCE(e.max_score,0)),0) * 100, 2), 0)::FLOAT AS "avgPercentage",
    COALESCE(ROUND(AVG(COALESCE(er.grade_point,0))::NUMERIC, 2), 0)::FLOAT AS "avgGradePoint",
    SUM(CASE WHEN er.grade_letter = 'A' THEN 1 ELSE 0 END)::INT AS "gradeACount",
    SUM(CASE WHEN er.grade_letter = 'B' THEN 1 ELSE 0 END)::INT AS "gradeBCount",
    SUM(CASE WHEN er.grade_letter = 'C' THEN 1 ELSE 0 END)::INT AS "gradeCCount",
    SUM(CASE WHEN er.grade_letter = 'D' THEN 1 ELSE 0 END)::INT AS "gradeDCount",
    SUM(CASE WHEN er.grade_letter = 'F' THEN 1 ELSE 0 END)::INT AS "gradeFCount"
FROM exams e
JOIN exam_results er ON er.exam_id = e.id AND er.is_deleted = FALSE AND er.is_active = TRUE
JOIN classes c ON e.class_id = c.id AND c.is_deleted = FALSE AND c.is_active = TRUE
JOIN subjects subj ON e.subject_id = subj.id
JOIN terms t ON e.term_id = t.id
JOIN academic_years ay ON t.academic_year_id = ay.id
LEFT JOIN staff st ON e.teacher_id = st.id
LEFT JOIN users u ON st.user_id = u.id
WHERE e.is_deleted = FALSE AND e.is_active = TRUE
GROUP BY e.id, e.school_id, e.title, subj.id, subj.name, c.id, c.name, t.id, t.name, ay.name, u.first_name, u.last_name;

-- ============================================
-- CONSOLIDATED CLEANUP & FIXES
-- All idempotent — safe for fresh installs AND upgrades
-- ============================================

-- 1. Drop redundant academics views (duplicates of student_grades/class_schedule)
DROP VIEW IF EXISTS academics_classperformance_summary_view CASCADE;
DROP VIEW IF EXISTS academics_exams_performance_summary_view CASCADE;
DROP VIEW IF EXISTS academics_exams_performance_view CASCADE;
DROP VIEW IF EXISTS academics_subjectperformance_summary_view CASCADE;
DROP VIEW IF EXISTS academics_studentterm_performance_view CASCADE;

-- 2. Add missing columns to classes table (idempotent)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS curriculum_id BIGINT REFERENCES curricula(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS class_teacher_id BIGINT REFERENCES staff(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS stream_id BIGINT REFERENCES streams(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS room VARCHAR(50);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id BIGINT REFERENCES staff(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS description TEXT;

-- Add missing columns to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS curriculum_id BIGINT REFERENCES curricula(id) ON DELETE SET NULL;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS grade_level_id BIGINT REFERENCES grade_levels(id) ON DELETE SET NULL;

-- ============================================
-- Ensure only ONE current academic year per school
-- ============================================
-- Partial unique index: only one row per school can have is_current = TRUE
CREATE UNIQUE INDEX IF NOT EXISTS idx_academic_years_current_per_school
ON academic_years(school_id) WHERE is_current = TRUE AND is_deleted = FALSE;

-- Trigger to auto-set other years to not-current when one is marked current
CREATE OR REPLACE FUNCTION fn_set_current_academic_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = TRUE THEN
        UPDATE academic_years
        SET is_current = FALSE, updated_at = NOW()
        WHERE school_id = NEW.school_id
          AND id != NEW.id
          AND is_deleted = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_academic_year_current ON academic_years;
CREATE TRIGGER trg_academic_year_current
BEFORE INSERT OR UPDATE ON academic_years
FOR EACH ROW EXECUTE FUNCTION fn_set_current_academic_year();

-- 3. Combine streams into classes (add stream column if not exists)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS stream VARCHAR(20);

-- Migrate existing stream data
UPDATE classes c
SET stream = s.code
FROM streams s
WHERE c.stream_id = s.id AND c.stream IS NULL;

-- 4. Create class_teachers junction table
CREATE TABLE IF NOT EXISTS class_teachers (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    subject_id BIGINT REFERENCES subjects(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    academic_year VARCHAR(20),
    term_id BIGINT REFERENCES terms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(school_id, class_id, teacher_id, subject_id)
);

ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='class_teachers' AND policyname='class_teachers_isolation') THEN
        EXECUTE 'DROP POLICY class_teachers_isolation ON class_teachers';
    END IF;
END$$;

CREATE POLICY class_teachers_isolation ON class_teachers
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_class_teachers_class ON class_teachers(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher ON class_teachers(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_subject ON class_teachers(school_id, subject_id);

DROP TRIGGER IF EXISTS trg_class_teachers_audit ON class_teachers;
CREATE TRIGGER trg_class_teachers_audit
AFTER INSERT OR UPDATE OR DELETE ON class_teachers
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Migrate existing class_teacher_id to class_teachers
INSERT INTO class_teachers (school_id, class_id, teacher_id, is_primary, is_deleted)
SELECT school_id, id, class_teacher_id, TRUE, FALSE
FROM classes
WHERE class_teacher_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM class_teachers ct 
    WHERE ct.class_id = classes.id AND ct.school_id = classes.school_id AND ct.teacher_id = classes.class_teacher_id
  );

-- 5. Drop duplicate trigger on classes
DROP TRIGGER IF EXISTS trg_classes_updated ON classes;

DO $$
BEGIN
    RAISE NOTICE '✅ Academics schema complete';
END $$;