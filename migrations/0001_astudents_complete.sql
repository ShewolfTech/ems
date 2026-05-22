-- ============================================
-- Students Domain - Complete Migration
-- Guardians, Relationships, Status Lifecycle
-- ============================================




-- ============================================
-- Bit 7: students (Application + Lifecycle Identity with Permissions)
-- ============================================

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY, -- permanent student_id
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- linked after admission
    admission_no BIGINT NOT NULL, -- assigned at admission (universal student ID)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    guardian_name VARCHAR(100),
    guardian_contact VARCHAR(50),
    previous_school VARCHAR(150),
    application_date DATE DEFAULT NOW(),
    admission_date DATE,
    admission_status_id BIGINT REFERENCES statuses(id), -- applied, admitted, rejected, waitlisted
    is_active BOOLEAN DEFAULT TRUE, -- ✅ lifecycle toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE, -- ✅ soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE (school_id, admission_no) -- ✅ tenant-scoped uniqueness
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='students' AND policyname='students_isolation'
    ) THEN
        EXECUTE 'DROP POLICY students_isolation ON students';
    END IF;
END$$;

CREATE POLICY students_isolation ON students
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_school_name 
    ON students(school_id, last_name);

CREATE INDEX IF NOT EXISTS idx_students_admission_no 
    ON students(school_id, admission_no);

CREATE INDEX IF NOT EXISTS idx_students_admission_status_active
    ON students(admission_status_id)
    WHERE is_deleted = FALSE AND is_active = TRUE;

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_students_audit ON students;
CREATE TRIGGER trg_students_audit
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_student(
    _school_id BIGINT, _first_name TEXT, _last_name TEXT, _dob DATE,
    _gender TEXT, _guardian_name TEXT, _guardian_contact TEXT, _previous_school TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('students','insert');

    INSERT INTO students (
        school_id, first_name, last_name, date_of_birth, gender,
        guardian_name, guardian_contact, previous_school,
        application_date, created_by
    )
    VALUES (
        _school_id, _first_name, _last_name, _dob, _gender,
        _guardian_name, _guardian_contact, _previous_school,
        NOW(), current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_student(
    _id BIGINT, _first_name TEXT, _last_name TEXT, _dob DATE,
    _gender TEXT, _guardian_name TEXT, _guardian_contact TEXT,
    _previous_school TEXT, _admission_date DATE, _admission_status_id BIGINT, _is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('students','update');

    UPDATE students SET
        first_name = COALESCE(_first_name, first_name),
        last_name = COALESCE(_last_name, last_name),
        date_of_birth = COALESCE(_dob, date_of_birth),
        gender = COALESCE(_gender, gender),
        guardian_name = COALESCE(_guardian_name, guardian_name),
        guardian_contact = COALESCE(_guardian_contact, guardian_contact),
        previous_school = COALESCE(_previous_school, previous_school),
        admission_date = COALESCE(_admission_date, admission_date),
        admission_status_id = COALESCE(_admission_status_id, admission_status_id),
        is_active = COALESCE(_is_active, is_active),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_student(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('students','delete');

    UPDATE students
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper (single record)
CREATE OR REPLACE FUNCTION select_student(_id BIGINT) RETURNS SETOF students AS $$
BEGIN
    PERFORM require_permission('students','view');

    RETURN QUERY
    SELECT *
    FROM students
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper (all records for current school)
CREATE OR REPLACE FUNCTION list_students() RETURNS SETOF students AS $$
BEGIN
    PERFORM require_permission('students','view');

    RETURN QUERY
    SELECT *
    FROM students
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- List students by admission status
CREATE OR REPLACE FUNCTION list_students_by_status(_status_id BIGINT) RETURNS SETOF students AS $$
BEGIN
    PERFORM require_permission('students','view');

    RETURN QUERY
    SELECT *
    FROM students
    WHERE school_id = current_school_id()
      AND admission_status_id = _status_id
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- List students admitted in a given date range
CREATE OR REPLACE FUNCTION list_students_by_admission_date(_start DATE, _end DATE) RETURNS SETOF students AS $$
BEGIN
    PERFORM require_permission('students','view');

    RETURN QUERY
    SELECT *
    FROM students
    WHERE school_id = current_school_id()
      AND admission_date BETWEEN _start AND _end
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Summary counts
CREATE OR REPLACE FUNCTION report_student_counts() RETURNS TABLE (
    total_students BIGINT,
    active_students BIGINT,
    deleted_students BIGINT
) AS $$
BEGIN
    PERFORM require_permission('students','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_students,
           COUNT(*) FILTER (WHERE is_active = TRUE AND is_deleted = FALSE) AS active_students,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_students
    FROM students
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;

-- CRUD functions
GRANT EXECUTE ON FUNCTION insert_student(BIGINT,TEXT,TEXT,DATE,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_student(BIGINT,TEXT,TEXT,DATE,TEXT,TEXT,TEXT,TEXT,DATE,BIGINT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_student(BIGINT) TO authenticated;

-- Read wrappers
GRANT EXECUTE ON FUNCTION select_student(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_students() TO authenticated;

-- Reporting/export functions
GRANT EXECUTE ON FUNCTION list_students_by_status(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_students_by_admission_date(DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION report_student_counts() TO authenticated;


-- ============================================
-- PART 1: GUARDIANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS guardians (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,  -- parent, guardian, sibling, grandparent, etc.
    email VARCHAR(150),
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    occupation VARCHAR(100),
    employer VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,  -- primary contact guardian
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    can_pickup BOOLEAN DEFAULT FALSE,  -- authorized to pick up student
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- if guardian also has app access
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='guardians' AND policyname='guardians_isolation') THEN
        EXECUTE 'DROP POLICY guardians_isolation ON guardians';
    END IF;
END$$;

CREATE POLICY guardians_isolation ON guardians
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_guardians_school_student ON guardians(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON guardians(school_id, email);
CREATE INDEX IF NOT EXISTS idx_guardians_phone ON guardians(school_id, phone);
CREATE INDEX IF NOT EXISTS idx_guardians_primary ON guardians(school_id, student_id) WHERE is_primary = TRUE AND is_deleted = FALSE;

-- ============================================
-- PART 2: STUDENT RELATIONSHIPS
-- ============================================

CREATE TABLE IF NOT EXISTS student_relationships (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    related_student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,  -- sibling, cousin, etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT student_relationships_unique UNIQUE (school_id, student_id, related_student_id, relationship_type)
);

ALTER TABLE student_relationships ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_relationships' AND policyname='student_relationships_isolation') THEN
        EXECUTE 'DROP POLICY student_relationships_isolation ON student_relationships';
    END IF;
END$$;

CREATE POLICY student_relationships_isolation ON student_relationships
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_student_relationships_student ON student_relationships(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_student_relationships_related ON student_relationships(school_id, related_student_id);

-- ============================================
-- PART 3: STUDENT STATUS HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS student_status_history (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'active', 'graduated', 'transferred_out', 'transferred_in',
        'withdrawn', 'suspended', 'expelled', 'deceased', 'on_leave'
    )),
    previous_status VARCHAR(50),
    reason TEXT,
    effective_date DATE NOT NULL,
    notes TEXT,
    document_url VARCHAR(500),  -- transfer letter, withdrawal form, etc.
    processed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE
);

ALTER TABLE student_status_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_status_history' AND policyname='student_status_history_isolation') THEN
        EXECUTE 'DROP POLICY student_status_history_isolation ON student_status_history';
    END IF;
END$$;

CREATE POLICY student_status_history_isolation ON student_status_history
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_student_status_history_student ON student_status_history(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_student_status_history_status ON student_status_history(school_id, status);
CREATE INDEX IF NOT EXISTS idx_student_status_history_date ON student_status_history(school_id, effective_date DESC);

-- ============================================
-- PART 4: ADD COLUMNS ON STUDENTS
-- ============================================

-- Add email and phone columns if they don't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Ugandan';
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_certificate_no VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);
ALTER TABLE students ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- Add enrollment_status column to track current academic state
ALTER TABLE students ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(50) DEFAULT 'active'
    CHECK (enrollment_status IN ('active', 'graduated', 'transferred', 'withdrawn', 'suspended', 'on_leave'));

-- Add current grade/class tracking
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_grade_id BIGINT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_class_id BIGINT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_stream VARCHAR(50);

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_students_email ON students(school_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_enrollment_status ON students(school_id, enrollment_status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_students_current_grade ON students(school_id, current_grade_id) WHERE current_grade_id IS NOT NULL;

-- ============================================
-- PART 5: TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS trg_guardians_updated_at ON guardians;
CREATE TRIGGER trg_guardians_updated_at
BEFORE UPDATE ON guardians
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_guardians_audit ON guardians;
CREATE TRIGGER trg_guardians_audit
AFTER INSERT OR UPDATE OR DELETE ON guardians
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_student_relationships_audit ON student_relationships;
CREATE TRIGGER trg_student_relationships_audit
AFTER INSERT OR DELETE ON student_relationships
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_student_status_history_audit ON student_status_history;
CREATE TRIGGER trg_student_status_history_audit
AFTER INSERT OR DELETE ON student_status_history
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- PART 6: FUNCTIONS
-- ============================================

-- Get student with guardian info
CREATE OR REPLACE FUNCTION get_student_with_guardians(_student_id BIGINT)
RETURNS TABLE (
    student_id BIGINT,
    first_name VARCHAR,
    last_name VARCHAR,
    admission_no BIGINT,
    enrollment_status VARCHAR,
    guardians JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.admission_no,
        s.enrollment_status,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', g.id,
                    'first_name', g.first_name,
                    'last_name', g.last_name,
                    'relationship', g.relationship,
                    'email', g.email,
                    'phone', g.phone,
                    'is_primary', g.is_primary,
                    'is_emergency_contact', g.is_emergency_contact
                )
            ) FILTER (WHERE g.id IS NOT NULL),
            '[]'::jsonb
        ) AS guardians
    FROM students s
    LEFT JOIN guardians g ON s.id = g.student_id AND g.is_deleted = FALSE
    WHERE s.id = _student_id AND s.is_deleted = FALSE
    GROUP BY s.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change student status with history tracking
CREATE OR REPLACE FUNCTION change_student_status(
    _student_id BIGINT,
    _new_status VARCHAR,
    _reason TEXT DEFAULT NULL,
    _notes TEXT DEFAULT NULL,
    _effective_date DATE DEFAULT CURRENT_DATE,
    _document_url VARCHAR DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    _old_status VARCHAR;
    _school_id BIGINT;
BEGIN
    -- Get current status
    SELECT enrollment_status, school_id INTO _old_status, _school_id
    FROM students WHERE id = _student_id AND is_deleted = FALSE;

    -- Update student
    UPDATE students
    SET enrollment_status = _new_status,
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _student_id AND is_deleted = FALSE;

    -- Record history
    INSERT INTO student_status_history (
        school_id, student_id, status, previous_status,
        reason, effective_date, notes, document_url,
        processed_by, created_by
    ) VALUES (
        _school_id, _student_id, _new_status, _old_status,
        _reason, _effective_date, _notes, _document_url,
        current_user_id(), current_user_id()
    );

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get student statistics
CREATE OR REPLACE FUNCTION get_student_statistics(_school_id BIGINT)
RETURNS TABLE (
    total_students BIGINT,
    active_students BIGINT,
    graduated BIGINT,
    transferred BIGINT,
    withdrawn BIGINT,
    suspended BIGINT,
    on_leave BIGINT,
    by_gender JSONB,
    new_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE is_deleted = FALSE) AS total_students,
        COUNT(*) FILTER (WHERE enrollment_status = 'active' AND is_deleted = FALSE) AS active_students,
        COUNT(*) FILTER (WHERE enrollment_status = 'graduated' AND is_deleted = FALSE) AS graduated,
        COUNT(*) FILTER (WHERE enrollment_status = 'transferred' AND is_deleted = FALSE) AS transferred,
        COUNT(*) FILTER (WHERE enrollment_status = 'withdrawn' AND is_deleted = FALSE) AS withdrawn,
        COUNT(*) FILTER (WHERE enrollment_status = 'suspended' AND is_deleted = FALSE) AS suspended,
        COUNT(*) FILTER (WHERE enrollment_status = 'on_leave' AND is_deleted = FALSE) AS on_leave,
        jsonb_build_object(
            'male', COUNT(*) FILTER (WHERE gender = 'male' AND is_deleted = FALSE),
            'female', COUNT(*) FILTER (WHERE gender = 'female' AND is_deleted = FALSE),
            'other', COUNT(*) FILTER (WHERE gender NOT IN ('male', 'female') AND is_deleted = FALSE)
        ) AS by_gender,
        COUNT(*) FILTER (WHERE is_deleted = FALSE AND created_at >= date_trunc('month', NOW())) AS new_this_month
    FROM students
    WHERE school_id = _school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6b: GRANTS FOR NEW FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION get_student_with_guardians(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_student_status(BIGINT,VARCHAR,TEXT,TEXT,DATE,VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_statistics(BIGINT) TO authenticated;

-- ============================================
-- PART 7: COMMENTS
-- ============================================

COMMENT ON TABLE guardians IS 'Parent/guardian records linked to students';
COMMENT ON TABLE student_relationships IS 'Relationships between students (siblings, etc.)';
COMMENT ON TABLE student_status_history IS 'Audit trail of student status changes';
COMMENT ON COLUMN students.user_id IS 'Links to users table for authentication';
COMMENT ON COLUMN students.enrollment_status IS 'Current academic status: active, graduated, transferred, withdrawn, suspended, on_leave';
COMMENT ON COLUMN students.current_grade_id IS 'Current grade level';
COMMENT ON COLUMN students.current_class_id IS 'Current class/section';
COMMENT ON COLUMN guardians.is_primary IS 'Primary contact guardian';
COMMENT ON COLUMN guardians.is_emergency_contact IS 'Authorized emergency contact';
COMMENT ON COLUMN guardians.can_pickup IS 'Authorized to pick up student from school';
COMMENT ON COLUMN student_relationships.relationship_type IS 'Type of relationship: sibling, cousin, etc.';

-- ============================================
-- PART 8: SEED DATA (Guardian relationship types)
-- ============================================

-- Note: Guardian relationship types are stored directly in the guardians table
-- Common values: parent, mother, father, guardian, grandparent, sibling, aunt, uncle, other
-- ============================================
-- PART 9: INNOVATIVE STUDENT MANAGEMENT RESOURCES
-- ============================================

-- House System for Gamification
CREATE TABLE IF NOT EXISTS student_houses (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#008080', -- Teal default
    motto TEXT,
    house_master_id BIGINT REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(school_id, name)
);

-- Update students table to link to a house
ALTER TABLE students ADD COLUMN IF NOT EXISTS house_id BIGINT REFERENCES student_houses(id);

-- Conduct & Behavior Ledger (Merits/Demerits)
CREATE TABLE IF NOT EXISTS student_conduct_logs (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- e.g., 'Leadership', 'Punctuality', 'Discipline'
    points INTEGER NOT NULL,        -- Positive for merits, negative for demerits
    description TEXT,
    incident_date DATE DEFAULT CURRENT_DATE,
    logged_by BIGINT NOT NULL REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Student Digital Identity (for Clocking In/Out)
CREATE TABLE IF NOT EXISTS student_id_registry (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    card_uuid VARCHAR(100) UNIQUE, -- RFID/NFC UID
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, lost, suspended
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, student_id)
);

-- Innovative: Student Wellbeing "Pulse" Tracker
-- Used to track non-academic health and sentiment
CREATE TABLE IF NOT EXISTS student_wellbeing_pulse (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    sentiment_score INTEGER CHECK (sentiment_score BETWEEN 1 AND 5), -- 1: Distressed, 5: Thriving
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    notes TEXT,
    pulse_date DATE DEFAULT CURRENT_DATE,
    logged_by BIGINT REFERENCES users(id), -- Can be student or counselor
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 10: ANALYTICS VIEWS & FUNCTIONS
-- ============================================

-- House Points Leaderboard
CREATE OR REPLACE VIEW v_house_leaderboard AS
SELECT 
    sh.school_id,
    sh.name AS house_name,
    sh.color_code,
    COALESCE(SUM(scl.points), 0) AS total_points,
    COUNT(DISTINCT s.id) AS member_count
FROM student_houses sh
LEFT JOIN students s ON s.house_id = sh.id
LEFT JOIN student_conduct_logs scl ON scl.student_id = s.id AND scl.is_deleted = FALSE
WHERE sh.is_deleted = FALSE
GROUP BY sh.id, sh.school_id, sh.name, sh.color_code;

-- Function to get Real-time Presence Status
CREATE OR REPLACE FUNCTION get_student_on_campus_status(_student_id BIGINT)
RETURNS TEXT AS $$
DECLARE
    last_event VARCHAR;
BEGIN
    SELECT event_type INTO last_event
    FROM campus_access_logs
    WHERE user_id = (SELECT user_id FROM students WHERE id = _student_id)
    ORDER BY event_at DESC
    LIMIT 1;

    RETURN COALESCE(last_event, 'off_campus');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS & GRANTS
-- ============================================
ALTER TABLE student_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_conduct_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_id_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_wellbeing_pulse ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_houses' AND policyname='student_houses_isolation') THEN
        EXECUTE 'DROP POLICY student_houses_isolation ON student_houses';
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_conduct_logs' AND policyname='student_conduct_isolation') THEN
        EXECUTE 'DROP POLICY student_conduct_isolation ON student_conduct_logs';
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_wellbeing_pulse' AND policyname='student_wellbeing_isolation') THEN
        EXECUTE 'DROP POLICY student_wellbeing_isolation ON student_wellbeing_pulse';
    END IF;
END$$;

CREATE POLICY student_houses_isolation ON student_houses FOR ALL TO authenticated 
USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id());

CREATE POLICY student_conduct_isolation ON student_conduct_logs FOR ALL TO authenticated 
USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id());

CREATE POLICY student_wellbeing_isolation ON student_wellbeing_pulse FOR ALL TO authenticated 
USING (school_id = current_school_id()) WITH CHECK (school_id = current_school_id());

GRANT SELECT, INSERT, UPDATE ON student_houses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON student_conduct_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON student_id_registry TO authenticated;
GRANT SELECT, INSERT, UPDATE ON student_wellbeing_pulse TO authenticated;
GRANT SELECT ON v_house_leaderboard TO authenticated;

-- Triggers
CREATE TRIGGER trg_conduct_logs_updated_at BEFORE UPDATE ON student_conduct_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- PART 11: INNOVATIVE STUDENT LIFE RESOURCES (Full CRUD & RLS)
-- ============================================

-- 1. Student Houses (Gamification)
CREATE TABLE IF NOT EXISTS student_houses (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#008080',
    motto TEXT,
    house_master_id BIGINT REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, name)
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS house_id BIGINT REFERENCES student_houses(id);

-- 2. Student Conduct Ledger (Merits/Demerits)
CREATE TABLE IF NOT EXISTS student_conduct_logs (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- Leadership, Punctuality, Discipline, etc.
    points INTEGER NOT NULL,        -- Positive for merits, negative for demerits
    description TEXT,
    incident_date DATE DEFAULT CURRENT_DATE,
    logged_by BIGINT NOT NULL REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- 3. Student ID & Access Registry (RFID/NFC)
CREATE TABLE IF NOT EXISTS student_id_registry (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    card_uuid VARCHAR(100) UNIQUE, 
    status VARCHAR(20) DEFAULT 'active', -- active, lost, suspended
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(school_id, student_id)
);

-- 4. Student Wellbeing Pulse
CREATE TABLE IF NOT EXISTS student_wellbeing_pulse (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    sentiment_score INTEGER CHECK (sentiment_score BETWEEN 1 AND 5),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    notes TEXT,
    pulse_date DATE DEFAULT CURRENT_DATE,
    logged_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================
-- RLS & INDEXES
-- ============================================
ALTER TABLE student_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_conduct_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_id_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_wellbeing_pulse ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_houses' AND policyname='student_houses_isolation') THEN
        EXECUTE 'DROP POLICY student_houses_isolation ON student_houses';
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_conduct_logs' AND policyname='student_conduct_isolation') THEN
        EXECUTE 'DROP POLICY student_conduct_isolation ON student_conduct_logs';
    END IF;
END$$;

CREATE POLICY student_houses_isolation ON student_houses FOR ALL TO authenticated 
USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id());

CREATE POLICY student_conduct_isolation ON student_conduct_logs FOR ALL TO authenticated 
USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id());

CREATE INDEX IF NOT EXISTS idx_conduct_student ON student_conduct_logs(student_id, incident_date);
CREATE INDEX IF NOT EXISTS idx_wellbeing_student ON student_wellbeing_pulse(student_id, pulse_date);
CREATE INDEX IF NOT EXISTS idx_registry_uuid ON student_id_registry(card_uuid);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_student_houses_updated BEFORE UPDATE ON student_houses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_student_houses_audit AFTER INSERT OR UPDATE OR DELETE ON student_houses FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER trg_student_conduct_updated BEFORE UPDATE ON student_conduct_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_student_conduct_audit AFTER INSERT OR UPDATE OR DELETE ON student_conduct_logs FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD FUNCTIONS
-- ============================================

-- HOUSE CRUD
CREATE OR REPLACE FUNCTION insert_student_house(_name TEXT, _color TEXT, _motto TEXT, _master_id BIGINT) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('student_houses','insert');
    INSERT INTO student_houses (school_id, name, color_code, motto, house_master_id)
    VALUES (current_school_id(), _name, _color, _motto, _master_id)
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_student_houses() RETURNS SETOF student_houses AS $$
BEGIN
    PERFORM require_permission('student_houses','view');
    RETURN QUERY SELECT * FROM student_houses WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CONDUCT CRUD
CREATE OR REPLACE FUNCTION insert_conduct_log(_student_id BIGINT, _category TEXT, _points INTEGER, _description TEXT) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('student_conduct','insert');
    INSERT INTO student_conduct_logs (school_id, student_id, category, points, description, logged_by)
    VALUES (current_school_id(), _student_id, _category, _points, _description, current_user_id())
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- WELLBEING CRUD
CREATE OR REPLACE FUNCTION log_wellbeing_pulse(_student_id BIGINT, _sentiment INT, _energy INT, _notes TEXT) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    INSERT INTO student_wellbeing_pulse (school_id, student_id, sentiment_score, energy_level, notes, logged_by)
    VALUES (current_school_id(), _student_id, _sentiment, _energy, _notes, current_user_id())
    RETURNING id INTO new_id;
    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INNOVATION: SMART ATTENDANCE & AUTOMATIC MERITS
-- ============================================

CREATE OR REPLACE FUNCTION process_student_clock_in(_card_uuid TEXT, _location TEXT) 
RETURNS JSONB AS $$
DECLARE 
    _student_id BIGINT;
    _school_id BIGINT;
    _points_awarded INT := 0;
    _arrival_time TIME := CURRENT_TIME;
BEGIN
    -- 1. Identify Student
    SELECT student_id, school_id INTO _student_id, _school_id 
    FROM student_id_registry WHERE card_uuid = _card_uuid AND status = 'active';
    
    IF _student_id IS NULL THEN 
        RAISE EXCEPTION 'Invalid or inactive ID card';
    END IF;

    -- 2. Log Access (Using existing campus_access_logs pattern)
    INSERT INTO campus_access_logs (school_id, user_id, event_type, method, location_name)
    VALUES (_school_id, (SELECT user_id FROM students WHERE id = _student_id), 'sign_in', 'nfc', _location);

    -- 3. Innovation: Punctuality Gamification
    -- Award 5 points if they arrive before 7:30 AM
    IF _arrival_time < '07:30:00'::TIME THEN
        INSERT INTO student_conduct_logs (school_id, student_id, category, points, description, logged_by, is_verified)
        VALUES (_school_id, _student_id, 'Punctuality', 5, 'Early arrival auto-reward', 1, TRUE); -- Logged by system (1)
        _points_awarded := 5;
    END IF;

    UPDATE student_id_registry SET last_scanned_at = NOW() WHERE student_id = _student_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'student_id', _student_id,
        'points_awarded', _points_awarded,
        'message', CASE WHEN _points_awarded > 0 THEN 'Welcome! +5 Punctuality points awarded.' ELSE 'Clock-in successful.' END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT SELECT, INSERT, UPDATE ON student_houses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON student_conduct_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON student_id_registry TO authenticated;
GRANT SELECT, INSERT, UPDATE ON student_wellbeing_pulse TO authenticated;
GRANT EXECUTE ON FUNCTION process_student_clock_in(TEXT, TEXT) TO authenticated;

DO $$
BEGIN
    RAISE NOTICE '✅ Students Domain fully updated with Innovative CRUD and RLS logic';
END $$;
