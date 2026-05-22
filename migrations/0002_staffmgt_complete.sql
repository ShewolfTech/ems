-- ============================================
-- Staff Management Domain - Complete Migration
-- Hiring, Contracts, ID & Access, Leave, Attendance, Performance, Training, Disciplinary, Payroll
-- ============================================



-- ============================================
-- PART 1: JOBS (Hiring)
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT REFERENCES departments(id),
    employment_type VARCHAR(50),
    requirements TEXT,
    responsibilities TEXT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency VARCHAR(3),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',
    posted_at TIMESTAMPTZ,
    closing_date DATE,
    created_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='jobs' AND policyname='jobs_isolation') THEN
        EXECUTE 'DROP POLICY jobs_isolation ON jobs';
    END IF;
END$$;

CREATE POLICY jobs_isolation ON jobs
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_jobs_school_status ON jobs(school_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department_id);

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON jobs;
CREATE TRIGGER trg_jobs_updated_at
BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_jobs_audit ON jobs;
CREATE TRIGGER trg_jobs_audit
AFTER INSERT OR UPDATE OR DELETE ON jobs FOR EACH ROW EXECUTE FUNCTION log_audit();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_job(
    _school_id BIGINT, _title TEXT, _description TEXT, _department_id BIGINT,
    _employment_type TEXT, _requirements TEXT, _responsibilities TEXT,
    _salary_min DECIMAL, _salary_max DECIMAL, _salary_currency TEXT,
    _location TEXT, _closing_date DATE
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('jobs','insert');

    INSERT INTO jobs (school_id, title, description, department_id, employment_type,
        requirements, responsibilities, salary_min, salary_max, salary_currency,
        location, closing_date, created_by)
    VALUES (_school_id, _title, _description, _department_id, _employment_type,
        _requirements, _responsibilities, _salary_min, _salary_max, _salary_currency,
        _location, _closing_date, current_user_id())
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_job(
    _id BIGINT, _title TEXT, _description TEXT, _department_id BIGINT,
    _employment_type TEXT, _requirements TEXT, _responsibilities TEXT,
    _salary_min DECIMAL, _salary_max DECIMAL, _salary_currency TEXT,
    _location TEXT, _status TEXT, _closing_date DATE
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('jobs','update');

    UPDATE jobs SET
        title = COALESCE(_title, title),
        description = COALESCE(_description, description),
        department_id = COALESCE(_department_id, department_id),
        employment_type = COALESCE(_employment_type, employment_type),
        requirements = COALESCE(_requirements, requirements),
        responsibilities = COALESCE(_responsibilities, responsibilities),
        salary_min = COALESCE(_salary_min, salary_min),
        salary_max = COALESCE(_salary_max, salary_max),
        salary_currency = COALESCE(_salary_currency, salary_currency),
        location = COALESCE(_location, location),
        status = COALESCE(_status, status),
        closing_date = COALESCE(_closing_date, closing_date),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_job(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('jobs','delete');

    UPDATE jobs SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_job(_id BIGINT) RETURNS SETOF jobs AS $$
BEGIN
    PERFORM require_permission('jobs','view');
    RETURN QUERY SELECT * FROM jobs WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_jobs(_status TEXT DEFAULT NULL) RETURNS SETOF jobs AS $$
BEGIN
    PERFORM require_permission('jobs','view');
    RETURN QUERY SELECT * FROM jobs 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_status IS NULL OR status = _status);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON jobs TO authenticated;
GRANT EXECUTE ON FUNCTION insert_job(BIGINT,TEXT,TEXT,BIGINT,TEXT,TEXT,TEXT,DECIMAL,DECIMAL,TEXT,TEXT,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION update_job(BIGINT,TEXT,TEXT,BIGINT,TEXT,TEXT,TEXT,DECIMAL,DECIMAL,TEXT,TEXT,TEXT,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_job(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_job(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_jobs(TEXT) TO authenticated;



-- ============================================
-- PART 2: JOB APPLICATIONS (Hiring)
-- ============================================

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url VARCHAR(500),
    cover_letter TEXT,
    status VARCHAR(20) DEFAULT 'submitted',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    interviewer_id BIGINT,
    interview_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_applications' AND policyname='job_applications_isolation') THEN
        EXECUTE 'DROP POLICY job_applications_isolation ON job_applications';
    END IF;
END$$;

CREATE POLICY job_applications_isolation ON job_applications
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);

DROP TRIGGER IF EXISTS trg_applications_updated_at ON job_applications;
CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_application(
    _school_id BIGINT, _job_id BIGINT, _first_name TEXT, _last_name TEXT,
    _email TEXT, _phone TEXT, _resume_url TEXT, _cover_letter TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('job_applications','insert');

    INSERT INTO job_applications (school_id, job_id, first_name, last_name, email, phone, resume_url, cover_letter)
    VALUES (_school_id, _job_id, _first_name, _last_name, _email, _phone, _resume_url, _cover_letter)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_application(_id BIGINT, _status TEXT, _notes TEXT, _interviewer_id BIGINT, _interview_date TIMESTAMPTZ) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('job_applications','update');

    UPDATE job_applications SET
        status = COALESCE(_status, status),
        notes = COALESCE(_notes, notes),
        interviewer_id = COALESCE(_interviewer_id, interviewer_id),
        interview_date = COALESCE(_interview_date, interview_date),
        updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_application(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('job_applications','delete');

    UPDATE job_applications SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_application(_id BIGINT) RETURNS SETOF job_applications AS $$
BEGIN
    PERFORM require_permission('job_applications','view');
    RETURN QUERY SELECT * FROM job_applications WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_applications(_job_id BIGINT DEFAULT NULL, _status TEXT DEFAULT NULL) RETURNS SETOF job_applications AS $$
BEGIN
    PERFORM require_permission('job_applications','view');
    RETURN QUERY SELECT * FROM job_applications 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_job_id IS NULL OR job_id = _job_id)
    AND (_status IS NULL OR status = _status);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON job_applications TO authenticated;
GRANT EXECUTE ON FUNCTION insert_application(BIGINT,BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_application(BIGINT,TEXT,TEXT,BIGINT,TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_application(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_application(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_applications(BIGINT,TEXT) TO authenticated;



-- ============================================
-- PART 3: STAFF CONTRACTS
-- ============================================

CREATE TABLE IF NOT EXISTS staff_contracts (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) UNIQUE,
    contract_type VARCHAR(50),
    job_title VARCHAR(255),
    department_id BIGINT REFERENCES departments(id),
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(12,2),
    salary_currency VARCHAR(3),
    salary_frequency VARCHAR(20) DEFAULT 'monthly',
    probation_period_days INT,
    notice_period_days INT,
    terms TEXT,
    document_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft',
    signed_at TIMESTAMPTZ,
    signed_by BIGINT,
    created_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE staff_contracts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_contracts' AND policyname='staff_contracts_isolation') THEN
        EXECUTE 'DROP POLICY staff_contracts_isolation ON staff_contracts';
    END IF;
END$$;

CREATE POLICY staff_contracts_isolation ON staff_contracts
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_contracts_staff ON staff_contracts(staff_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON staff_contracts(status);

DROP TRIGGER IF EXISTS trg_contracts_updated_at ON staff_contracts;
CREATE TRIGGER trg_contracts_updated_at
BEFORE UPDATE ON staff_contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_contract(
    _school_id BIGINT, _staff_id BIGINT, _contract_type TEXT, _job_title TEXT,
    _department_id BIGINT, _start_date DATE, _end_date DATE, _salary DECIMAL,
    _salary_currency TEXT, _salary_frequency TEXT, _probation_period_days INT,
    _notice_period_days INT, _terms TEXT, _document_url TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT; _contract_number TEXT;
BEGIN
    PERFORM require_permission('staff_contracts','insert');

    SELECT 'CNT/' || EXTRACT(YEAR FROM NOW()) || '/' || TO_CHAR(NEXTVAL('contracts_seq'), 'FM0000') INTO _contract_number;

    INSERT INTO staff_contracts (school_id, staff_id, contract_type, job_title, department_id,
        start_date, end_date, salary, salary_currency, salary_frequency,
        probation_period_days, notice_period_days, terms, document_url, contract_number)
    VALUES (_school_id, _staff_id, _contract_type, _job_title, _department_id,
        _start_date, _end_date, _salary, _salary_currency, _salary_frequency,
        _probation_period_days, _notice_period_days, _terms, _document_url, _contract_number)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_contract(
    _id BIGINT, _contract_type TEXT, _job_title TEXT, _end_date DATE,
    _salary DECIMAL, _salary_currency TEXT, _status TEXT, _signed_at TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_contracts','update');

    UPDATE staff_contracts SET
        contract_type = COALESCE(_contract_type, contract_type),
        job_title = COALESCE(_job_title, job_title),
        end_date = COALESCE(_end_date, end_date),
        salary = COALESCE(_salary, salary),
        salary_currency = COALESCE(_salary_currency, salary_currency),
        status = COALESCE(_status, status),
        signed_at = COALESCE(_signed_at, signed_at),
        updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_contract(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_contracts','delete');

    UPDATE staff_contracts SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_contract(_id BIGINT) RETURNS SETOF staff_contracts AS $$
BEGIN
    PERFORM require_permission('staff_contracts','view');
    RETURN QUERY SELECT * FROM staff_contracts WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_contracts(_staff_id BIGINT DEFAULT NULL, _status TEXT DEFAULT NULL) RETURNS SETOF staff_contracts AS $$
BEGIN
    PERFORM require_permission('staff_contracts','view');
    RETURN QUERY SELECT * FROM staff_contracts 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_staff_id IS NULL OR staff_id = _staff_id)
    AND (_status IS NULL OR status = _status);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contract Actions
CREATE OR REPLACE FUNCTION renew_contract(_id BIGINT, _new_end_date DATE, _new_salary DECIMAL) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_contracts','update');

    UPDATE staff_contracts SET status = 'renewed', updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id();

    INSERT INTO staff_contracts (school_id, staff_id, contract_type, job_title, department_id,
        start_date, end_date, salary, salary_currency, salary_frequency, status)
    SELECT school_id, staff_id, contract_type, job_title, department_id,
        _new_end_date + INTERVAL '1 day', NULL, _new_salary, salary_currency, salary_frequency, 'active'
    FROM staff_contracts WHERE id = _id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION terminate_contract(_id BIGINT, _termination_date DATE, _reason TEXT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_contracts','update');

    UPDATE staff_contracts SET 
        status = 'terminated', end_date = _termination_date, terms = _reason, updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status = 'active';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON staff_contracts TO authenticated;
GRANT EXECUTE ON FUNCTION insert_contract(BIGINT,BIGINT,TEXT,TEXT,BIGINT,DATE,DATE,DECIMAL,TEXT,TEXT,INT,INT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_contract(BIGINT,TEXT,TEXT,DATE,DECIMAL,TEXT,TEXT,TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_contract(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_contract(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_contracts(BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION renew_contract(BIGINT,DATE,DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION terminate_contract(BIGINT,DATE,TEXT) TO authenticated;


-- Sequence for contract numbers
CREATE SEQUENCE IF NOT EXISTS contracts_seq;



-- ============================================
-- PART 4: STAFF ID & ACCESS
-- ============================================

CREATE TABLE IF NOT EXISTS staff_id_access (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    staff_id_number VARCHAR(50) UNIQUE,
    rfid_card_number VARCHAR(100),
    fingerprint_id VARCHAR(100),
    access_level VARCHAR(20) DEFAULT 'restricted',
    access_zones JSONB,
    allowed_buildings JSONB,
    allowed_entries JSONB,
    valid_from DATE,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'inactive',
    issued_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    issued_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE staff_id_access ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_id_access' AND policyname='staff_id_access_isolation') THEN
        EXECUTE 'DROP POLICY staff_id_access_isolation ON staff_id_access';
    END IF;
END$$;

CREATE POLICY staff_id_access_isolation ON staff_id_access
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_idaccess_staff ON staff_id_access(staff_id);
CREATE INDEX IF NOT EXISTS idx_idaccess_rfid ON staff_id_access(rfid_card_number);

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_staff_access(
    _school_id BIGINT, _staff_id BIGINT, _rfid_card_number TEXT, _access_level TEXT,
    _access_zones JSONB, _allowed_buildings JSONB, _valid_from DATE, _valid_until DATE
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT; _id_number TEXT;
BEGIN
    PERFORM require_permission('staff_id_access','insert');

    _id_number := 'STF' || TO_CHAR(NEXTVAL('staffid_seq'), 'FM00000');

    INSERT INTO staff_id_access (school_id, staff_id, rfid_card_number, access_level, access_zones,
        allowed_buildings, valid_from, valid_until, staff_id_number, issued_at, status)
    VALUES (_school_id, _staff_id, _rfid_card_number, _access_level, _access_zones,
        _allowed_buildings, _valid_from, _valid_until, _id_number, NOW(), 'active')
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_staff_access(
    _id BIGINT, _access_level TEXT, _access_zones JSONB, _allowed_buildings JSONB, _valid_until DATE
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_id_access','update');

    UPDATE staff_id_access SET
        access_level = COALESCE(_access_level, access_level),
        access_zones = COALESCE(_access_zones, access_zones),
        allowed_buildings = COALESCE(_allowed_buildings, allowed_buildings),
        valid_until = COALESCE(_valid_until, valid_until),
        updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deactivate_staff_access(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_id_access','update');

    UPDATE staff_id_access SET status = 'inactive', returned_at = NOW(), updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status = 'active';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reactivate_staff_access(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_id_access','update');

    UPDATE staff_id_access SET status = 'active', returned_at = NULL, updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status = 'inactive';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_staff_access(_id BIGINT) RETURNS SETOF staff_id_access AS $$
BEGIN
    PERFORM require_permission('staff_id_access','view');
    RETURN QUERY SELECT * FROM staff_id_access WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_staff_access(_staff_id BIGINT DEFAULT NULL) RETURNS SETOF staff_id_access AS $$
BEGIN
    PERFORM require_permission('staff_id_access','view');
    RETURN QUERY SELECT * FROM staff_id_access 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_staff_id IS NULL OR staff_id = _staff_id);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE SEQUENCE IF NOT EXISTS staffid_seq;

GRANT SELECT, INSERT, UPDATE ON staff_id_access TO authenticated;
GRANT EXECUTE ON FUNCTION insert_staff_access(BIGINT,BIGINT,TEXT,TEXT,JSONB,JSONB,DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION update_staff_access(BIGINT,TEXT,JSONB,JSONB,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_staff_access(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_staff_access(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_staff_access(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_staff_access(BIGINT) TO authenticated;



-- ============================================
-- PART 5: LEAVE TYPES
-- ============================================

CREATE TABLE IF NOT EXISTS leave_types (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    category VARCHAR(20),
    description TEXT,
    max_days_per_year INT,
    max_consecutive_days INT,
    requires_approval BOOLEAN DEFAULT TRUE,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, code)
);

ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leave_types' AND policyname='leave_types_isolation') THEN
        EXECUTE 'DROP POLICY leave_types_isolation ON leave_types';
    END IF;
END$$;

CREATE POLICY leave_types_isolation ON leave_types
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_leavetypes_school ON leave_types(school_id);

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_leave_type(
    _school_id BIGINT, _name TEXT, _code TEXT, _category TEXT,
    _description TEXT, _max_days_per_year INT, _max_consecutive_days INT,
    _requires_approval BOOLEAN, _is_paid BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('leave_types','insert');

    INSERT INTO leave_types (school_id, name, code, category, description, max_days_per_year,
        max_consecutive_days, requires_approval, is_paid)
    VALUES (_school_id, _name, _code, _category, _description, _max_days_per_year,
        _max_consecutive_days, _requires_approval, _is_paid)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_leave_type(
    _id BIGINT, _name TEXT, _description TEXT, _max_days_per_year INT,
    _max_consecutive_days INT, _is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_types','update');

    UPDATE leave_types SET
        name = COALESCE(_name, name),
        description = COALESCE(_description, description),
        max_days_per_year = COALESCE(_max_days_per_year, max_days_per_year),
        max_consecutive_days = COALESCE(_max_consecutive_days, max_consecutive_days),
        is_active = COALESCE(_is_active, is_active),
        updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_leave_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_types','delete');

    UPDATE leave_types SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_leave_type(_id BIGINT) RETURNS SETOF leave_types AS $$
BEGIN
    PERFORM require_permission('leave_types','view');
    RETURN QUERY SELECT * FROM leave_types WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_leave_types() RETURNS SETOF leave_types AS $$
BEGIN
    PERFORM require_permission('leave_types','view');
    RETURN QUERY SELECT * FROM leave_types WHERE school_id = current_school_id() AND is_deleted = FALSE AND is_active = TRUE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON leave_types TO authenticated;
GRANT EXECUTE ON FUNCTION insert_leave_type(BIGINT,TEXT,TEXT,TEXT,TEXT,INT,INT,BOOLEAN,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_leave_type(BIGINT,TEXT,TEXT,INT,INT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_leave_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_leave_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_leave_types() TO authenticated;



-- ============================================
-- PART 6: STAFF LEAVE QUOTAS
-- ============================================

CREATE TABLE IF NOT EXISTS staff_leave_quotas (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type_id BIGINT REFERENCES leave_types(id) ON DELETE CASCADE,
    year INT NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    used_days DECIMAL(5,1) DEFAULT 0,
    remaining_days DECIMAL(5,1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(staff_id, leave_type_id, year)
);

ALTER TABLE staff_leave_quotas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_leave_quotas' AND policyname='staff_leave_quotas_isolation') THEN
        EXECUTE 'DROP POLICY staff_leave_quotas_isolation ON staff_leave_quotas';
    END IF;
END$$;

CREATE POLICY staff_leave_quotas_isolation ON staff_leave_quotas
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_leavequotas_staff_year ON staff_leave_quotas(staff_id, year);

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_leave_quota(
    _school_id BIGINT, _staff_id BIGINT, _leave_type_id BIGINT, _year INT, _total_days DECIMAL
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('staff_leave_quotas','insert');

    INSERT INTO staff_leave_quotas (school_id, staff_id, leave_type_id, year, total_days, remaining_days)
    VALUES (_school_id, _staff_id, _leave_type_id, _year, _total_days, _total_days)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_leave_quota(_id BIGINT, _total_days DECIMAL) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('staff_leave_quotas','update');

    UPDATE staff_leave_quotas SET
        total_days = COALESCE(_total_days, total_days),
        remaining_days = total_days + (_total_days - total_days) - used_days,
        updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_leave_quota(_id BIGINT) RETURNS SETOF staff_leave_quotas AS $$
BEGIN
    PERFORM require_permission('staff_leave_quotas','view');
    RETURN QUERY SELECT * FROM staff_leave_quotas WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_leave_quotas(_staff_id BIGINT DEFAULT NULL, _year INT DEFAULT NULL) RETURNS SETOF staff_leave_quotas AS $$
BEGIN
    PERFORM require_permission('staff_leave_quotas','view');
    RETURN QUERY SELECT * FROM staff_leave_quotas 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_staff_id IS NULL OR staff_id = _staff_id)
    AND (_year IS NULL OR year = _year);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON staff_leave_quotas TO authenticated;
GRANT EXECUTE ON FUNCTION insert_leave_quota(BIGINT,BIGINT,BIGINT,INT,DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_leave_quota(BIGINT,DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION select_leave_quota(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_leave_quotas(BIGINT,INT) TO authenticated;



-- ============================================
-- PART 7: LEAVE REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type_id BIGINT REFERENCES leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,1),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by BIGINT,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leave_requests' AND policyname='leave_requests_isolation') THEN
        EXECUTE 'DROP POLICY leave_requests_isolation ON leave_requests';
    END IF;
END$$;

CREATE POLICY leave_requests_isolation ON leave_requests
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_leaverequests_staff ON leave_requests(staff_id, start_date);
CREATE INDEX IF NOT EXISTS idx_leaverequests_status ON leave_requests(status);

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_leave_request(
    _school_id BIGINT, _staff_id BIGINT, _leave_type_id BIGINT,
    _start_date DATE, _end_date DATE, _reason TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT; _total DECIMAL(5,1);
BEGIN
    PERFORM require_permission('leave_requests','insert');

    _total := EXTRACT(DAY FROM _end_date - _start_date) + 1;

    INSERT INTO leave_requests (school_id, staff_id, leave_type_id, start_date, end_date, total_days, reason)
    VALUES (_school_id, _staff_id, _leave_type_id, _start_date, _end_date, _total, _reason)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_leave_request(_id BIGINT, _approved_by BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_requests','update');

    UPDATE leave_requests SET 
        status = 'approved', approved_by = _approved_by, approved_at = NOW(), updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status = 'pending';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_leave_request(_id BIGINT, _approved_by BIGINT, _reason TEXT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_requests','update');

    UPDATE leave_requests SET 
        status = 'rejected', approved_by = _approved_by, approved_at = NOW(), rejection_reason = _reason, updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status = 'pending';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_leave_request(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_requests','update');

    UPDATE leave_requests SET status = 'cancelled', updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status = 'pending';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_leave_request(_id BIGINT) RETURNS SETOF leave_requests AS $$
BEGIN
    PERFORM require_permission('leave_requests','view');
    RETURN QUERY SELECT * FROM leave_requests WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_leave_requests(_staff_id BIGINT DEFAULT NULL, _status TEXT DEFAULT NULL) RETURNS SETOF leave_requests AS $$
BEGIN
    PERFORM require_permission('leave_requests','view');
    RETURN QUERY SELECT * FROM leave_requests 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_staff_id IS NULL OR staff_id = _staff_id)
    AND (_status IS NULL OR status = _status);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON leave_requests TO authenticated;
GRANT EXECUTE ON FUNCTION insert_leave_request(BIGINT,BIGINT,BIGINT,DATE,DATE,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_leave_request(BIGINT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_leave_request(BIGINT,BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_leave_request(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_leave_request(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_leave_requests(BIGINT,TEXT) TO authenticated;



-- ============================================
-- PART 8: STAFF ATTENDANCE
-- ============================================

CREATE TABLE IF NOT EXISTS staff_attendance (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    late_minutes INT DEFAULT 0,
    early_leave_minutes INT DEFAULT 0,
    total_hours DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'present',
    notes TEXT,
    device_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(staff_id, date)
);

ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_attendance' AND policyname='staff_attendance_isolation') THEN
        EXECUTE 'DROP POLICY staff_attendance_isolation ON staff_attendance';
    END IF;
END$$;

CREATE POLICY staff_attendance_isolation ON staff_attendance
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_staffattendance_staff_date ON staff_attendance(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_staffattendance_date ON staff_attendance(date);

-- CRUD Functions
CREATE OR REPLACE FUNCTION clock_in(_staff_id BIGINT, _device_id TEXT DEFAULT NULL) RETURNS BIGINT AS $$
DECLARE new_id BIGINT; _today DATE := CURRENT_DATE; _now TIMESTAMPTZ := NOW(); _expected TIMESTAMPTZ;
BEGIN
    _expected := _today::TIMESTAMPTZ + INTERVAL '8 hours';

    INSERT INTO staff_attendance (staff_id, school_id, date, clock_in_time, late_minutes, status, device_id)
    VALUES (_staff_id, current_school_id(), _today, _now, 
        CASE WHEN _now > _expected THEN EXTRACT(EPOCH FROM (_now - _expected))/60 ELSE 0 END,
        CASE WHEN _now > _expected + INTERVAL '15 minutes' THEN 'late' ELSE 'present' END,
        _device_id)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clock_out(_staff_id BIGINT) RETURNS VOID AS $$
DECLARE _rec RECORD; _now TIMESTAMPTZ := NOW(); _expected_end TIMESTAMPTZ;
BEGIN
    SELECT * INTO _rec FROM staff_attendance 
    WHERE staff_id = _staff_id AND date = CURRENT_DATE AND school_id = current_school_id() AND is_deleted = FALSE;

    IF _rec.clock_out_time IS NOT NULL THEN
        RAISE EXCEPTION 'Already clocked out';
    END IF;

    _expected_end := _rec.date::TIMESTAMPTZ + INTERVAL '17 hours';

    UPDATE staff_attendance SET 
        clock_out_time = _now,
        total_hours = EXTRACT(EPOCH FROM (_now - _rec.clock_in_time))/3600,
        early_leave_minutes = CASE WHEN _now < _expected_end THEN EXTRACT(EPOCH FROM (_expected_end - _now))/60 ELSE 0 END,
        updated_at = NOW()
    WHERE id = _rec.id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_staff_attendance(_id BIGINT) RETURNS SETOF staff_attendance AS $$
BEGIN
    PERFORM require_permission('staff_attendance','view');
    RETURN QUERY SELECT * FROM staff_attendance WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_staff_attendance(_staff_id BIGINT DEFAULT NULL, _start_date DATE DEFAULT NULL, _end_date DATE DEFAULT NULL) RETURNS SETOF staff_attendance AS $$
BEGIN
    PERFORM require_permission('staff_attendance','view');
    RETURN QUERY SELECT * FROM staff_attendance 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_staff_id IS NULL OR staff_id = _staff_id)
    AND (_start_date IS NULL OR date >= _start_date)
    AND (_end_date IS NULL OR date <= _end_date);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION report_attendance_summary(_date DATE DEFAULT CURRENT_DATE) RETURNS TABLE(present INT, absent INT, late INT) AS $$
BEGIN
    PERFORM require_permission('staff_attendance','view');

    RETURN QUERY
    SELECT COUNT(*) FILTER(WHERE status = 'present'),
           COUNT(*) FILTER(WHERE status = 'absent'),
           COUNT(*) FILTER(WHERE status = 'late')
    FROM staff_attendance WHERE date = _date AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON staff_attendance TO authenticated;
GRANT EXECUTE ON FUNCTION clock_in(BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clock_out(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_staff_attendance(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_staff_attendance(BIGINT,DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION report_attendance_summary(DATE) TO authenticated;



-- ============================================
-- PART 9: PERFORMANCE REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS performance_reviews (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    reviewer_id BIGINT REFERENCES staff(id),
    review_period_start DATE,
    review_period_end DATE,
    review_date DATE,
    overall_rating INT,
    goals_achievement INT,
    teamwork INT,
    communication INT,
    professionalism INT,
    strengths TEXT,
    areas_for_improvement TEXT,
    comments TEXT,
    recommendations TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='performance_reviews' AND policyname='performance_reviews_isolation') THEN
        EXECUTE 'DROP POLICY performance_reviews_isolation ON performance_reviews';
    END IF;
END$$;

CREATE POLICY performance_reviews_isolation ON performance_reviews
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- CRUD Functions (similar pattern to above)
CREATE OR REPLACE FUNCTION insert_performance_review(
    _school_id BIGINT, _staff_id BIGINT, _reviewer_id BIGINT,
    _review_period_start DATE, _review_period_end DATE
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('performance_reviews','insert');

    INSERT INTO performance_reviews (school_id, staff_id, reviewer_id, review_period_start, review_period_end)
    VALUES (_school_id, _staff_id, _reviewer_id, _review_period_start, _review_period_end)
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_performance_review(
    _id BIGINT, _overall_rating INT, _goals_achievement INT, _teamwork INT,
    _communication INT, _professionalism INT, _strengths TEXT, _areas_for_improvement TEXT,
    _comments TEXT, _recommendations TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('performance_reviews','update');

    UPDATE performance_reviews SET
        overall_rating = _overall_rating, goals_achievement = _goals_achievement,
        teamwork = _teamwork, communication = _communication, professionalism = _professionalism,
        strengths = _strengths, areas_for_improvement = _areas_for_improvement,
        comments = _comments, recommendations = _recommendations,
        status = 'completed', review_date = CURRENT_DATE, updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND status != 'completed';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_performance_reviews(_staff_id BIGINT DEFAULT NULL, _status TEXT DEFAULT NULL) RETURNS SETOF performance_reviews AS $$
BEGIN
    PERFORM require_permission('performance_reviews','view');
    RETURN QUERY SELECT * FROM performance_reviews 
    WHERE school_id = current_school_id() AND is_deleted = FALSE 
    AND (_staff_id IS NULL OR staff_id = _staff_id)
    AND (_status IS NULL OR status = _status);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON performance_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION insert_performance_review(BIGINT,BIGINT,BIGINT,DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_performance_review(BIGINT,INT,INT,INT,INT,INT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_performance_reviews(BIGINT,TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION select_performance_review(_id BIGINT) RETURNS SETOF performance_reviews AS $$
BEGIN
    PERFORM require_permission('performance_reviews','view');
    RETURN QUERY SELECT * FROM performance_reviews WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_performance_review(_id BIGINT, _strengths TEXT, _areas_for_improvement TEXT, _comments TEXT, _recommendations TEXT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('performance_reviews','update');
    UPDATE performance_reviews SET
        strengths = COALESCE(_strengths, strengths),
        areas_for_improvement = COALESCE(_areas_for_improvement, areas_for_improvement),
        comments = COALESCE(_comments, comments),
        recommendations = COALESCE(_recommendations, recommendations),
        updated_at = NOW()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_performance_review(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('performance_reviews','delete');
    UPDATE performance_reviews SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION select_performance_review(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_performance_review(BIGINT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_performance_review(BIGINT) TO authenticated;



-- ============================================
-- PART 10: STAFF PROMOTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS staff_promotions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    current_title VARCHAR(255),
    new_title VARCHAR(255) NOT NULL,
    current_salary DECIMAL(12,2),
    new_salary DECIMAL(12,2),
    salary_currency VARCHAR(3),
    effective_date DATE,
    reason TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE staff_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_promotions_isolation ON staff_promotions FOR ALL TO authenticated USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- CRUD Functions
CREATE OR REPLACE FUNCTION insert_promotion(_school_id BIGINT, _staff_id BIGINT, _new_title TEXT, _new_salary DECIMAL, _effective_date DATE, _reason TEXT) RETURNS BIGINT AS $$ DECLARE new_id BIGINT; BEGIN PERFORM require_permission('staff_promotions','insert'); INSERT INTO staff_promotions (school_id, staff_id, new_title, new_salary, effective_date, reason) VALUES (_school_id, _staff_id, _new_title, _new_salary, _effective_date, _reason) RETURNING id INTO new_id; RETURN new_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_promotion(_id BIGINT, _approved_by BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_promotions','update'); UPDATE staff_promotions SET status = 'approved', approved_by = _approved_by, approved_at = NOW() WHERE id = _id AND status = 'pending'; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_promotion(_id BIGINT) RETURNS SETOF staff_promotions AS $$ BEGIN PERFORM require_permission('staff_promotions','view'); RETURN QUERY SELECT * FROM staff_promotions WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_promotion(_id BIGINT, _new_title TEXT, _new_salary DECIMAL) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_promotions','update'); UPDATE staff_promotions SET new_title = COALESCE(_new_title, new_title), new_salary = COALESCE(_new_salary, new_salary), updated_at = NOW() WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_promotion(_id BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_promotions','delete'); UPDATE staff_promotions SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = current_user_id() WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_promotions(_staff_id BIGINT DEFAULT NULL) RETURNS SETOF staff_promotions AS $$ BEGIN PERFORM require_permission('staff_promotions','view'); RETURN QUERY SELECT * FROM staff_promotions WHERE school_id = current_school_id() AND is_deleted = FALSE AND (_staff_id IS NULL OR staff_id = _staff_id); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON staff_promotions TO authenticated;
GRANT EXECUTE ON FUNCTION insert_promotion(BIGINT,BIGINT,TEXT,DECIMAL,DATE,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_promotion(BIGINT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_promotions(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_promotion(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_promotion(BIGINT,TEXT,DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_promotion(BIGINT) TO authenticated;


-- ============================================
-- PART 11: TRAINING COURSES
-- ============================================

CREATE TABLE IF NOT EXISTS training_courses (
    id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, description TEXT, category VARCHAR(50), provider VARCHAR(255),
    start_date DATE NOT NULL, end_date DATE NOT NULL, duration_hours DECIMAL(5,2),
    location VARCHAR(255), is_online BOOLEAN DEFAULT FALSE, certificate_url VARCHAR(500),
    cost DECIMAL(10,2), currency VARCHAR(3), max_participants INT,
    status VARCHAR(20) DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(), is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ, deleted_by BIGINT
);

ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_courses_isolation ON training_courses FOR ALL TO authenticated USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE OR REPLACE FUNCTION insert_course(_school_id BIGINT, _title TEXT, _category TEXT, _provider TEXT, _start_date DATE, _end_date DATE, _duration_hours DECIMAL, _location TEXT, _is_online BOOLEAN, _cost DECIMAL) RETURNS BIGINT AS $$ DECLARE new_id BIGINT; BEGIN PERFORM require_permission('training_courses','insert'); INSERT INTO training_courses (school_id, title, category, provider, start_date, end_date, duration_hours, location, is_online, cost) VALUES (_school_id, _title, _category, _provider, _start_date, _end_date, _duration_hours, _location, _is_online, _cost) RETURNING id INTO new_id; RETURN new_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION list_courses(_status TEXT DEFAULT NULL) RETURNS SETOF training_courses AS $$ BEGIN PERFORM require_permission('training_courses','view'); RETURN QUERY SELECT * FROM training_courses WHERE school_id = current_school_id() AND is_deleted = FALSE AND (_status IS NULL OR status = _status); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_course(_id BIGINT) RETURNS SETOF training_courses AS $$ BEGIN PERFORM require_permission('training_courses','view'); RETURN QUERY SELECT * FROM training_courses WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_course(_id BIGINT, _status TEXT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('training_courses','update'); UPDATE training_courses SET status = COALESCE(_status, status), updated_at = NOW() WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION soft_delete_course(_id BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('training_courses','delete'); UPDATE training_courses SET is_deleted = TRUE, deleted_at = NOW() WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON training_courses TO authenticated;
GRANT EXECUTE ON FUNCTION insert_course(BIGINT,TEXT,TEXT,TEXT,DATE,DATE,DECIMAL,TEXT,BOOLEAN,DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION list_courses(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_course(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_course(BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_course(BIGINT) TO authenticated;


-- ============================================
-- PART 12: TRAINING ENROLLMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS training_enrollments (
    id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE, course_id BIGINT REFERENCES training_courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ, certificate_url VARCHAR(500),
    grade VARCHAR(10), feedback TEXT, status VARCHAR(20) DEFAULT 'enrolled',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE, deleted_at TIMESTAMPTZ, deleted_by BIGINT,
    UNIQUE(staff_id, course_id)
);

ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_enrollments_isolation ON training_enrollments FOR ALL TO authenticated USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE OR REPLACE FUNCTION enroll_staff(_school_id BIGINT, _staff_id BIGINT, _course_id BIGINT) RETURNS BIGINT AS $$ DECLARE new_id BIGINT; BEGIN PERFORM require_permission('training_enrollments','insert'); INSERT INTO training_enrollments (school_id, staff_id, course_id) VALUES (_school_id, _staff_id, _course_id) RETURNING id INTO new_id; RETURN new_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION complete_enrollment(_id BIGINT, _grade TEXT, _feedback TEXT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('training_enrollments','update'); UPDATE training_enrollments SET status = 'completed', completed_at = NOW(), grade = _grade, feedback = _feedback WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION list_enrollments(_course_id BIGINT DEFAULT NULL) RETURNS SETOF training_enrollments AS $$ BEGIN PERFORM require_permission('training_enrollments','view'); RETURN QUERY SELECT * FROM training_enrollments WHERE school_id = current_school_id() AND is_deleted = FALSE AND (_course_id IS NULL OR course_id = _course_id); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_enrollment(_id BIGINT) RETURNS SETOF training_enrollments AS $$ BEGIN PERFORM require_permission('training_enrollments','view'); RETURN QUERY SELECT * FROM training_enrollments WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_enrollment(_id BIGINT, _status TEXT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('training_enrollments','update'); UPDATE training_enrollments SET status = COALESCE(_status, status) WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION soft_delete_enrollment(_id BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('training_enrollments','delete'); UPDATE training_enrollments SET is_deleted = TRUE WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON training_enrollments TO authenticated;
GRANT EXECUTE ON FUNCTION enroll_staff(BIGINT,BIGINT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_enrollment(BIGINT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_enrollments(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_enrollment(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_enrollment(BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_enrollment(BIGINT) TO authenticated;


-- ============================================
-- PART 13: STAFF CERTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS staff_certifications (
    id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, issuer VARCHAR(255),
    issue_date DATE, expiry_date DATE, credential_id VARCHAR(255), credential_url VARCHAR(500),
    document_url VARCHAR(500), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE, deleted_at TIMESTAMPTZ, deleted_by BIGINT
);

ALTER TABLE staff_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_certifications_isolation ON staff_certifications FOR ALL TO authenticated USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE OR REPLACE FUNCTION insert_certification(_school_id BIGINT, _staff_id BIGINT, _name TEXT, _issuer TEXT, _issue_date DATE, _expiry_date DATE, _credential_id TEXT) RETURNS BIGINT AS $$ DECLARE new_id BIGINT; BEGIN PERFORM require_permission('staff_certifications','insert'); INSERT INTO staff_certifications (school_id, staff_id, name, issuer, issue_date, expiry_date, credential_id) VALUES (_school_id, _staff_id, _name, _issuer, _issue_date, _expiry_date, _credential_id) RETURNING id INTO new_id; RETURN new_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION list_certifications(_staff_id BIGINT) RETURNS SETOF staff_certifications AS $$ BEGIN PERFORM require_permission('staff_certifications','view'); RETURN QUERY SELECT * FROM staff_certifications WHERE staff_id = _staff_id AND school_id = current_school_id() AND is_deleted = FALSE; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_certification(_id BIGINT) RETURNS SETOF staff_certifications AS $$ BEGIN PERFORM require_permission('staff_certifications','view'); RETURN QUERY SELECT * FROM staff_certifications WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_certification(_id BIGINT, _expiry_date DATE) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_certifications','update'); UPDATE staff_certifications SET expiry_date = _expiry_date, updated_at = NOW() WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION soft_delete_certification(_id BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_certifications','delete'); UPDATE staff_certifications SET is_deleted = TRUE WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON staff_certifications TO authenticated;
GRANT EXECUTE ON FUNCTION insert_certification(BIGINT,BIGINT,TEXT,TEXT,DATE,DATE,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_certifications(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_certification(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_certification(BIGINT,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_certification(BIGINT) TO authenticated;


-- ============================================
-- PART 14: DISCIPLINARY INCIDENTS
-- ============================================

CREATE TABLE IF NOT EXISTS disciplinary_incidents (
    id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE, incident_type VARCHAR(50),
    incident_date DATE, description TEXT NOT NULL, location VARCHAR(255), witnesses TEXT,
    reported_by BIGINT, incident_status VARCHAR(30) DEFAULT 'open', severity VARCHAR(20),
    action_taken TEXT, resolved_by BIGINT, resolved_at TIMESTAMPTZ, resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE, deleted_at TIMESTAMPTZ, deleted_by BIGINT
);

ALTER TABLE disciplinary_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY disciplinary_incidents_isolation ON disciplinary_incidents FOR ALL TO authenticated USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE OR REPLACE FUNCTION insert_incident(_school_id BIGINT, _staff_id BIGINT, _incident_type TEXT, _incident_date DATE, _description TEXT, _severity TEXT, _reported_by BIGINT) RETURNS BIGINT AS $$ DECLARE new_id BIGINT; BEGIN PERFORM require_permission('disciplinary_incidents','insert'); INSERT INTO disciplinary_incidents (school_id, staff_id, incident_type, incident_date, description, severity, reported_by) VALUES (_school_id, _staff_id, _incident_type, _incident_date, _description, _severity, _reported_by) RETURNING id INTO new_id; RETURN new_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION resolve_incident(_id BIGINT, _resolved_by BIGINT, _resolution_notes TEXT, _action_taken TEXT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('disciplinary_incidents','update'); UPDATE disciplinary_incidents SET incident_status = 'resolved', resolved_by = _resolved_by, resolved_at = NOW(), resolution_notes = _resolution_notes, action_taken = _action_taken WHERE id = _id AND incident_status = 'open'; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION list_incidents(_staff_id BIGINT DEFAULT NULL, _status TEXT DEFAULT NULL) RETURNS SETOF disciplinary_incidents AS $$ BEGIN PERFORM require_permission('disciplinary_incidents','view'); RETURN QUERY SELECT * FROM disciplinary_incidents WHERE school_id = current_school_id() AND is_deleted = FALSE AND (_staff_id IS NULL OR staff_id = _staff_id) AND (_status IS NULL OR incident_status = _status); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_incident(_id BIGINT) RETURNS SETOF disciplinary_incidents AS $$ BEGIN PERFORM require_permission('disciplinary_incidents','view'); RETURN QUERY SELECT * FROM disciplinary_incidents WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_incident(_id BIGINT, _incident_status TEXT, _action_taken TEXT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('disciplinary_incidents','update'); UPDATE disciplinary_incidents SET incident_status = COALESCE(_incident_status, incident_status), action_taken = COALESCE(_action_taken, action_taken) WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION soft_delete_incident(_id BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('disciplinary_incidents','delete'); UPDATE disciplinary_incidents SET is_deleted = TRUE WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON disciplinary_incidents TO authenticated;
GRANT EXECUTE ON FUNCTION insert_incident(BIGINT,BIGINT,TEXT,DATE,TEXT,TEXT,BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_incident(BIGINT,BIGINT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_incidents(BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_incident(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_incident(BIGINT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_incident(BIGINT) TO authenticated;


-- ============================================
-- PART 15: STAFF PAYROLL
-- ============================================

CREATE TABLE IF NOT EXISTS staff_payroll (
    id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE, bank_name VARCHAR(255),
    bank_account_number VARCHAR(50), bank_routing_number VARCHAR(50), bank_account_name VARCHAR(255),
    bank_account_type VARCHAR(20), base_salary DECIMAL(12,2), salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_frequency VARCHAR(20) DEFAULT 'monthly', tax_deductions DECIMAL(10,2) DEFAULT 0,
    benefits_deductions DECIMAL(10,2) DEFAULT 0, other_deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(12,2), is_active BOOLEAN DEFAULT TRUE, last_paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE, deleted_at TIMESTAMPTZ, deleted_by BIGINT,
    UNIQUE(staff_id)
);

ALTER TABLE staff_payroll ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_payroll_isolation ON staff_payroll FOR ALL TO authenticated USING (school_id = current_school_id() AND NOT is_deleted) WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE OR REPLACE FUNCTION insert_payroll(_school_id BIGINT, _staff_id BIGINT, _bank_name TEXT, _bank_account_number TEXT, _bank_routing_number TEXT, _bank_account_name TEXT, _bank_account_type TEXT, _base_salary DECIMAL, _salary_frequency TEXT) RETURNS BIGINT AS $$ DECLARE new_id BIGINT; _net DECIMAL; BEGIN PERFORM require_permission('staff_payroll','insert'); _net := _base_salary; INSERT INTO staff_payroll (school_id, staff_id, bank_name, bank_account_number, bank_routing_number, bank_account_name, bank_account_type, base_salary, salary_frequency, net_salary) VALUES (_school_id, _staff_id, _bank_name, _bank_account_number, _bank_routing_number, _bank_account_name, _bank_account_type, _base_salary, _salary_frequency, _net) RETURNING id INTO new_id; RETURN new_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_payroll(_id BIGINT, _base_salary DECIMAL, _tax_deductions DECIMAL, _benefits_deductions DECIMAL) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_payroll','update'); UPDATE staff_payroll SET base_salary = COALESCE(_base_salary, base_salary), tax_deductions = COALESCE(_tax_deductions, tax_deductions), benefits_deductions = COALESCE(_benefits_deductions, benefits_deductions), net_salary = COALESCE(_base_salary, base_salary) - COALESCE(_tax_deductions, tax_deductions, 0) - COALESCE(_benefits_deductions, benefits_deductions, 0), updated_at = NOW() WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION list_payroll(_is_active BOOLEAN DEFAULT TRUE) RETURNS SETOF staff_payroll AS $$ BEGIN PERFORM require_permission('staff_payroll','view'); RETURN QUERY SELECT * FROM staff_payroll WHERE school_id = current_school_id() AND is_deleted = FALSE AND is_active = _is_active; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION select_payroll(_id BIGINT) RETURNS SETOF staff_payroll AS $$ BEGIN PERFORM require_permission('staff_payroll','view'); RETURN QUERY SELECT * FROM staff_payroll WHERE id = _id AND school_id = current_school_id(); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION soft_delete_payroll(_id BIGINT) RETURNS VOID AS $$ BEGIN PERFORM require_permission('staff_payroll','delete'); UPDATE staff_payroll SET is_deleted = TRUE WHERE id = _id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT SELECT, INSERT, UPDATE ON staff_payroll TO authenticated;
GRANT EXECUTE ON FUNCTION insert_payroll(BIGINT,BIGINT,TEXT,TEXT,TEXT,TEXT,TEXT,DECIMAL,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_payroll(BIGINT,DECIMAL,DECIMAL,DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION list_payroll(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION select_payroll(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_payroll(BIGINT) TO authenticated;