-- ============================================
-- Bit 1/XX: campus_access_logs (Perimeter Sign-In/Out + Audit)
-- ============================================

CREATE TABLE IF NOT EXISTS campus_access_logs (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- ✅ unified staff/students

    -- Event type
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('sign_in','sign_out')),
    method VARCHAR(20) NOT NULL DEFAULT 'manual'
      CHECK (method IN ('manual','qr_scan','biometric','nfc','mobile_app','face_recognition')),

    -- Reference to assets
    asset_id BIGINT REFERENCES assets(id) ON DELETE SET NULL,
    device_code VARCHAR(100), -- optional human-readable code

    -- Biometric metadata
    biometric_match_confidence NUMERIC(5,2),
    biometric_template_hash TEXT,
    biometric_scan_quality VARCHAR(20),

    -- Location
    location_lat NUMERIC(10,7),
    location_lng NUMERIC(10,7),
    location_name VARCHAR(255),

    -- Timestamps
    event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Audit
    is_verified BOOLEAN DEFAULT true,
    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE campus_access_logs ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='campus_access_logs' AND policyname='campus_access_logs_isolation'
    ) THEN
        EXECUTE 'DROP POLICY campus_access_logs_isolation ON campus_access_logs';
    END IF;
END$$;

CREATE POLICY campus_access_logs_isolation ON campus_access_logs
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
-- Note: Using simple index on (user_id, event_at) since CAST/DATE are not immutable in PostgreSQL
-- For date-based queries, use: WHERE event_at >= '2024-01-01' AND event_at < '2024-01-02'
CREATE INDEX IF NOT EXISTS idx_campus_access_user_date 
ON campus_access_logs(user_id, event_at);

CREATE INDEX IF NOT EXISTS idx_campus_access_school_event 
ON campus_access_logs(school_id, event_type, event_at);

CREATE INDEX IF NOT EXISTS idx_campus_access_asset 
ON campus_access_logs(asset_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_campus_access_logs_updated_at ON campus_access_logs;
CREATE TRIGGER trg_campus_access_logs_updated_at
BEFORE UPDATE ON campus_access_logs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_campus_access_logs_audit ON campus_access_logs;
CREATE TRIGGER trg_campus_access_logs_audit
AFTER INSERT OR UPDATE OR DELETE ON campus_access_logs
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_campus_access_log(
    _user_id BIGINT,_event_type TEXT,_method TEXT,_asset_id BIGINT,_device_code TEXT,
    _location_name TEXT,_location_lat NUMERIC,_location_lng NUMERIC
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('campus_access_logs','insert');

    INSERT INTO campus_access_logs(
        school_id,user_id,event_type,method,asset_id,device_code,
        location_name,location_lat,location_lng,created_at,created_by
    )
    VALUES (
        current_school_id(),_user_id,_event_type,COALESCE(_method,'manual'),
        _asset_id,_device_code,_location_name,_location_lat,_location_lng,
        NOW(),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_campus_access_log(
    _id BIGINT,_method TEXT,_asset_id BIGINT,_device_code TEXT,
    _location_name TEXT,_location_lat NUMERIC,_location_lng NUMERIC,_is_verified BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('campus_access_logs','update');

    UPDATE campus_access_logs SET
        method = COALESCE(_method,method),
        asset_id = COALESCE(_asset_id,asset_id),
        device_code = COALESCE(_device_code,device_code),
        location_name = COALESCE(_location_name,location_name),
        location_lat = COALESCE(_location_lat,location_lat),
        location_lng = COALESCE(_location_lng,location_lng),
        is_verified = COALESCE(_is_verified,is_verified),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_campus_access_log(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('campus_access_logs','delete');

    UPDATE campus_access_logs
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper
CREATE OR REPLACE FUNCTION select_campus_access_log(_id BIGINT) RETURNS SETOF campus_access_logs AS $$
BEGIN
    PERFORM require_permission('campus_access_logs','view');

    RETURN QUERY
    SELECT *
    FROM campus_access_logs
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper
CREATE OR REPLACE FUNCTION list_campus_access_logs(_start_date DATE,_end_date DATE) RETURNS SETOF campus_access_logs AS $$
BEGIN
    PERFORM require_permission('campus_access_logs','view');

    RETURN QUERY
    SELECT *
    FROM campus_access_logs
    WHERE school_id = current_school_id()
      AND event_at::DATE BETWEEN _start_date AND _end_date
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_campus_access_summary(_start_date DATE,_end_date DATE) RETURNS TABLE (
    total_logs BIGINT,
    verified_logs BIGINT,
    unverified_logs BIGINT
) AS $$
BEGIN
    PERFORM require_permission('campus_access_logs','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_logs,
           COUNT(*) FILTER (WHERE is_verified = TRUE AND is_deleted = FALSE) AS verified_logs,
           COUNT(*) FILTER (WHERE is_verified = FALSE AND is_deleted = FALSE) AS unverified_logs
    FROM campus_access_logs
    WHERE school_id = current_school_id()
      AND event_at::DATE BETWEEN _start_date AND _end_date;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON campus_access_logs TO authenticated;

GRANT EXECUTE ON FUNCTION insert_campus_access_log(BIGINT,TEXT,TEXT,BIGINT,TEXT,TEXT,NUMERIC,NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION update_campus_access_log(BIGINT,TEXT,BIGINT,TEXT,TEXT,NUMERIC,NUMERIC,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_campus_access_log(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_campus_access_log(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_campus_access_logs(DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION report_campus_access_summary(DATE,DATE) TO authenticated;


-- ============================================
-- Bit 2/XX: attendance_sessions (Scheduled Roll Calls + Meetings)
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    class_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
    subject_id BIGINT REFERENCES subjects(id) ON DELETE SET NULL,
    meeting_title VARCHAR(255),
    meeting_type VARCHAR(50) CHECK (meeting_type IN (
        'pta','staff_training','exam_supervision','assembly','event','other'
    )),
    meeting_agenda TEXT,
    teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (end_time > start_time),
    session_type VARCHAR(20) NOT NULL DEFAULT 'class'
      CHECK (session_type IN ('school_day','class','assembly','homeroom','exam','event','meeting')),
    room_id BIGINT, -- Note: facilities table not yet created, FK constraint disabled
    term_id BIGINT REFERENCES terms(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
      CHECK (status IN ('scheduled','completed','cancelled')),
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
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='attendance_sessions' AND policyname='attendance_sessions_isolation'
    ) THEN
        EXECUTE 'DROP POLICY attendance_sessions_isolation ON attendance_sessions';
    END IF;
END$$;

CREATE POLICY attendance_sessions_isolation ON attendance_sessions
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_school_date 
ON attendance_sessions(school_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class 
ON attendance_sessions(class_id) WHERE class_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_meeting 
ON attendance_sessions(meeting_type) WHERE meeting_type IS NOT NULL;

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_attendance_sessions_updated_at ON attendance_sessions;
CREATE TRIGGER trg_attendance_sessions_updated_at
BEFORE UPDATE ON attendance_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_sessions_audit ON attendance_sessions;
CREATE TRIGGER trg_attendance_sessions_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance_sessions
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_attendance_session(
    _class_id BIGINT,_subject_id BIGINT,_meeting_title TEXT,_meeting_type TEXT,_meeting_agenda TEXT,
    _teacher_id BIGINT,_date DATE,_start_time TIME,_end_time TIME,_session_type TEXT,
    _room_id BIGINT,_term_id BIGINT,_status TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('attendance_sessions','insert');

    INSERT INTO attendance_sessions(
        school_id,class_id,subject_id,meeting_title,meeting_type,meeting_agenda,
        teacher_id,date,start_time,end_time,session_type,room_id,term_id,status,
        created_by
    )
    VALUES (
        current_school_id(),_class_id,_subject_id,_meeting_title,_meeting_type,_meeting_agenda,
        _teacher_id,_date,_start_time,_end_time,COALESCE(_session_type,'class'),
        _room_id,_term_id,COALESCE(_status,'scheduled'),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_attendance_session(
    _id BIGINT,_meeting_title TEXT,_meeting_type TEXT,_meeting_agenda TEXT,
    _date DATE,_start_time TIME,_end_time TIME,_session_type TEXT,_status TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_sessions','update');

    UPDATE attendance_sessions SET
        meeting_title = COALESCE(_meeting_title,meeting_title),
        meeting_type = COALESCE(_meeting_type,meeting_type),
        meeting_agenda = COALESCE(_meeting_agenda,meeting_agenda),
        date = COALESCE(_date,date),
        start_time = COALESCE(_start_time,start_time),
        end_time = COALESCE(_end_time,end_time),
        session_type = COALESCE(_session_type,session_type),
        status = COALESCE(_status,status),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_attendance_session(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_sessions','delete');

    UPDATE attendance_sessions
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper
CREATE OR REPLACE FUNCTION select_attendance_session(_id BIGINT) RETURNS SETOF attendance_sessions AS $$
BEGIN
    PERFORM require_permission('attendance_sessions','view');

    RETURN QUERY
    SELECT *
    FROM attendance_sessions
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper
CREATE OR REPLACE FUNCTION list_attendance_sessions(_start_date DATE,_end_date DATE) RETURNS SETOF attendance_sessions AS $$
BEGIN
    PERFORM require_permission('attendance_sessions','view');

    RETURN QUERY
    SELECT *
    FROM attendance_sessions
    WHERE school_id = current_school_id()
      AND date BETWEEN _start_date AND _end_date
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_attendance_sessions_summary(_start_date DATE,_end_date DATE) RETURNS TABLE (
    total_sessions BIGINT,
    completed_sessions BIGINT,
    cancelled_sessions BIGINT
) AS $$
BEGIN
    PERFORM require_permission('attendance_sessions','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_sessions,
           COUNT(*) FILTER (WHERE status = 'completed' AND is_deleted = FALSE) AS completed_sessions,
           COUNT(*) FILTER (WHERE status = 'cancelled' AND is_deleted = FALSE) AS cancelled_sessions
    FROM attendance_sessions
    WHERE school_id = current_school_id()
      AND date BETWEEN _start_date AND _end_date;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON attendance_sessions TO authenticated;

GRANT EXECUTE ON FUNCTION insert_attendance_session(BIGINT,BIGINT,TEXT,TEXT,TEXT,BIGINT,DATE,TIME,TIME,TEXT,BIGINT,BIGINT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_attendance_session(BIGINT,TEXT,TEXT,TEXT,DATE,TIME,TIME,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_attendance_session(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_attendance_session(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_attendance_sessions(DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION report_attendance_sessions_summary(DATE,DATE) TO authenticated;


-- ============================================
-- Bit 3/XX: attendance_records (Roll Calls + Verification)
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    session_id BIGINT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- ✅ unified staff/students

    -- Attendance mark
    status CHAR(1) NOT NULL DEFAULT 'A' CHECK (status IN ('P','A','L','E')),
    sign_type VARCHAR(10) DEFAULT 'rollcall' CHECK (sign_type IN ('in','out','rollcall')),
    remark VARCHAR(255),

    -- Audit
    recorded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Note: recorded_month removed - can be derived from recorded_at in queries
    -- For month-based queries, use: WHERE date_trunc('month', recorded_at) = date_trunc('month', NOW())

    -- Capture method
    method VARCHAR(20) NOT NULL DEFAULT 'manual'
      CHECK (method IN ('manual','badge','qr_scan','biometric','nfc','credentials','mobile_app','face_recognition')),

    -- Reference to assets
    asset_id BIGINT REFERENCES assets(id) ON DELETE SET NULL,
    device_code VARCHAR(100),

    -- Biometric metadata
    biometric_match_confidence NUMERIC(5,2),
    biometric_template_hash TEXT,
    biometric_scan_quality VARCHAR(20),

    -- Location
    location_lat NUMERIC(10,7),
    location_lng NUMERIC(10,7),

    -- Verification
    is_verified BOOLEAN NOT NULL DEFAULT true,
    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='attendance_records' AND policyname='attendance_records_isolation'
    ) THEN
        EXECUTE 'DROP POLICY attendance_records_isolation ON attendance_records';
    END IF;
END$$;

CREATE POLICY attendance_records_isolation ON attendance_records
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
-- Note: recorded_month index removed - use recorded_at for month-based queries
-- Example: WHERE date_trunc('month', recorded_at) = date_trunc('month', NOW())

CREATE INDEX IF NOT EXISTS idx_attendance_records_session 
ON attendance_records(session_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_status 
ON attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_attendance_records_method 
ON attendance_records(method);

CREATE INDEX IF NOT EXISTS idx_attendance_records_asset 
ON attendance_records(asset_id);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER trg_attendance_records_updated_at
BEFORE UPDATE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_records_audit ON attendance_records;
CREATE TRIGGER trg_attendance_records_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION log_audit();



-- ============================================
-- Bit 4/XX: attendance_policies (Rules + Compliance Thresholds)
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_policies (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    name VARCHAR(100) NOT NULL,
    min_sessions_per_day INTEGER DEFAULT 7,
    late_threshold_minutes INTEGER DEFAULT 15,
    absent_after_late_threshold INTEGER DEFAULT 30,
    consecutive_absence_alert INTEGER DEFAULT 3,
    truant_definition JSONB DEFAULT '{"consecutive_absences":5,"total_absence_percent":20}',
    auto_excuse_rules JSONB DEFAULT '{"sick_leave_exempt_days":2}',
    moes_min_attendance_percent NUMERIC(5,2) DEFAULT 85.00,
    sms_provider VARCHAR(20) DEFAULT 'mtn_uganda'
      CHECK (sms_provider IN ('mtn_uganda','airtel_ug','infobip','yo_africa')),
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
ALTER TABLE attendance_policies ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='attendance_policies' AND policyname='attendance_policies_isolation'
    ) THEN
        EXECUTE 'DROP POLICY attendance_policies_isolation ON attendance_policies';
    END IF;
END$$;

CREATE POLICY attendance_policies_isolation ON attendance_policies
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_policies_school_name 
ON attendance_policies(school_id, name);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_attendance_policies_updated_at ON attendance_policies;
CREATE TRIGGER trg_attendance_policies_updated_at
BEFORE UPDATE ON attendance_policies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_policies_audit ON attendance_policies;
CREATE TRIGGER trg_attendance_policies_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance_policies
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_attendance_policy(
    _name TEXT,_min_sessions_per_day INTEGER,_late_threshold_minutes INTEGER,
    _absent_after_late_threshold INTEGER,_consecutive_absence_alert INTEGER,
    _truant_definition JSONB,_auto_excuse_rules JSONB,_moes_min_attendance_percent NUMERIC,
    _sms_provider TEXT
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('attendance_policies','insert');

    INSERT INTO attendance_policies(
        school_id,name,min_sessions_per_day,late_threshold_minutes,
        absent_after_late_threshold,consecutive_absence_alert,
        truant_definition,auto_excuse_rules,moes_min_attendance_percent,
        sms_provider,created_by
    )
    VALUES (
        current_school_id(),_name,COALESCE(_min_sessions_per_day,7),
        COALESCE(_late_threshold_minutes,15),COALESCE(_absent_after_late_threshold,30),
        COALESCE(_consecutive_absence_alert,3),COALESCE(_truant_definition,'{"consecutive_absences":5,"total_absence_percent":20}'),
        COALESCE(_auto_excuse_rules,'{"sick_leave_exempt_days":2}'),
        COALESCE(_moes_min_attendance_percent,85.00),
        COALESCE(_sms_provider,'mtn_uganda'),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_attendance_policy(
    _id BIGINT,_name TEXT,_min_sessions_per_day INTEGER,_late_threshold_minutes INTEGER,
    _absent_after_late_threshold INTEGER,_consecutive_absence_alert INTEGER,
    _truant_definition JSONB,_auto_excuse_rules JSONB,_moes_min_attendance_percent NUMERIC,
    _sms_provider TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_policies','update');

    UPDATE attendance_policies SET
        name = COALESCE(_name,name),
        min_sessions_per_day = COALESCE(_min_sessions_per_day,min_sessions_per_day),
        late_threshold_minutes = COALESCE(_late_threshold_minutes,late_threshold_minutes),
        absent_after_late_threshold = COALESCE(_absent_after_late_threshold,absent_after_late_threshold),
        consecutive_absence_alert = COALESCE(_consecutive_absence_alert,consecutive_absence_alert),
        truant_definition = COALESCE(_truant_definition,truant_definition),
        auto_excuse_rules = COALESCE(_auto_excuse_rules,auto_excuse_rules),
        moes_min_attendance_percent = COALESCE(_moes_min_attendance_percent,moes_min_attendance_percent),
        sms_provider = COALESCE(_sms_provider,sms_provider),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_attendance_policy(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('attendance_policies','delete');

    UPDATE attendance_policies
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper
CREATE OR REPLACE FUNCTION select_attendance_policy(_id BIGINT) RETURNS SETOF attendance_policies AS $$
BEGIN
    PERFORM require_permission('attendance_policies','view');

    RETURN QUERY
    SELECT *
    FROM attendance_policies
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper
CREATE OR REPLACE FUNCTION list_attendance_policies() RETURNS SETOF attendance_policies AS $$
BEGIN
    PERFORM require_permission('attendance_policies','view');

    RETURN QUERY
    SELECT *
    FROM attendance_policies
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_attendance_policies_summary() RETURNS TABLE (
    total_policies BIGINT,
    active_policies BIGINT,
    deleted_policies BIGINT
) AS $$
BEGIN
    PERFORM require_permission('attendance_policies','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_policies,
           COUNT(*) FILTER (WHERE is_deleted = FALSE) AS active_policies,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_policies
    FROM attendance_policies
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON attendance_policies TO authenticated;

GRANT EXECUTE ON FUNCTION insert_attendance_policy(TEXT,INTEGER,INTEGER,INTEGER,INTEGER,JSONB,JSONB,NUMERIC,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_attendance_policy(BIGINT,TEXT,INTEGER,INTEGER,INTEGER,INTEGER,JSONB,JSONB,NUMERIC,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_attendance_policy(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_attendance_policy(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_attendance_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION report_attendance_policies_summary() TO authenticated;


-- ============================================
-- Bit 5/XX: leave_types (Configurable Leave Categories)
-- ============================================

CREATE TABLE IF NOT EXISTS leave_types (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    max_days_per_year INTEGER,
    requires_document BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    is_paid BOOLEAN DEFAULT false,
    is_for_students BOOLEAN DEFAULT true,
    is_for_staff BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    UNIQUE(school_id, code),
    UNIQUE(school_id, name)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='leave_types' AND policyname='leave_types_isolation'
    ) THEN
        EXECUTE 'DROP POLICY leave_types_isolation ON leave_types';
    END IF;
END$$;

CREATE POLICY leave_types_isolation ON leave_types
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leave_types_school_name 
ON leave_types(school_id, name);

CREATE INDEX IF NOT EXISTS idx_leave_types_school_code 
ON leave_types(school_id, code);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_leave_types_updated_at ON leave_types;
CREATE TRIGGER trg_leave_types_updated_at
BEFORE UPDATE ON leave_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leave_types_audit ON leave_types;
CREATE TRIGGER trg_leave_types_audit
AFTER INSERT OR UPDATE OR DELETE ON leave_types
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_leave_type(
    _name TEXT,_code TEXT,_description TEXT,_max_days_per_year INTEGER,
    _requires_document BOOLEAN,_requires_approval BOOLEAN,_is_paid BOOLEAN,
    _is_for_students BOOLEAN,_is_for_staff BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('leave_types','insert');

    INSERT INTO leave_types(
        school_id,name,code,description,max_days_per_year,
        requires_document,requires_approval,is_paid,
        is_for_students,is_for_staff,created_by
    )
    VALUES (
        current_school_id(),_name,_code,_description,_max_days_per_year,
        COALESCE(_requires_document,TRUE),COALESCE(_requires_approval,TRUE),
        COALESCE(_is_paid,FALSE),COALESCE(_is_for_students,TRUE),
        COALESCE(_is_for_staff,TRUE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_leave_type(
    _id BIGINT,_name TEXT,_code TEXT,_description TEXT,_max_days_per_year INTEGER,
    _requires_document BOOLEAN,_requires_approval BOOLEAN,_is_paid BOOLEAN,
    _is_for_students BOOLEAN,_is_for_staff BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_types','update');

    UPDATE leave_types SET
        name = COALESCE(_name,name),
        code = COALESCE(_code,code),
        description = COALESCE(_description,description),
        max_days_per_year = COALESCE(_max_days_per_year,max_days_per_year),
        requires_document = COALESCE(_requires_document,requires_document),
        requires_approval = COALESCE(_requires_approval,requires_approval),
        is_paid = COALESCE(_is_paid,is_paid),
        is_for_students = COALESCE(_is_for_students,is_for_students),
        is_for_staff = COALESCE(_is_for_staff,is_for_staff),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_leave_type(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leave_types','delete');

    UPDATE leave_types
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper
CREATE OR REPLACE FUNCTION select_leave_type(_id BIGINT) RETURNS SETOF leave_types AS $$
BEGIN
    PERFORM require_permission('leave_types','view');

    RETURN QUERY
    SELECT *
    FROM leave_types
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper
CREATE OR REPLACE FUNCTION list_leave_types() RETURNS SETOF leave_types AS $$
BEGIN
    PERFORM require_permission('leave_types','view');

    RETURN QUERY
    SELECT *
    FROM leave_types
    WHERE school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_leave_types_summary() RETURNS TABLE (
    total_types BIGINT,
    active_types BIGINT,
    deleted_types BIGINT
) AS $$
BEGIN
    PERFORM require_permission('leave_types','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_types,
           COUNT(*) FILTER (WHERE is_deleted = FALSE) AS active_types,
           COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_types
    FROM leave_types
    WHERE school_id = current_school_id();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON leave_types TO authenticated;

GRANT EXECUTE ON FUNCTION insert_leave_type(TEXT,TEXT,TEXT,INTEGER,BOOLEAN,BOOLEAN,BOOLEAN,BOOLEAN,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_leave_type(BIGINT,TEXT,TEXT,TEXT,INTEGER,BOOLEAN,BOOLEAN,BOOLEAN,BOOLEAN,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_leave_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_leave_type(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_leave_types() TO authenticated;
GRANT EXECUTE ON FUNCTION report_leave_types_summary() TO authenticated;


-- ============================================
-- Bit 6/XX: leaves (Leave Requests + Approvals)
-- ============================================

CREATE TABLE IF NOT EXISTS leaves (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE, -- ✅ tenant isolation
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- ✅ unified staff/students
    leave_type_id BIGINT NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    reason TEXT NOT NULL,
    document_url TEXT,
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('pending','approved','rejected','cancelled','completed')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    reject_reason TEXT,
    is_emergency BOOLEAN DEFAULT false,
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
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='leaves' AND policyname='leaves_isolation'
    ) THEN
        EXECUTE 'DROP POLICY leaves_isolation ON leaves';
    END IF;
END$$;

CREATE POLICY leaves_isolation ON leaves
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leaves_school_user 
ON leaves(school_id, user_id);

CREATE INDEX IF NOT EXISTS idx_leaves_school_type 
ON leaves(school_id, leave_type_id);

CREATE INDEX IF NOT EXISTS idx_leaves_status 
ON leaves(status);

-- ============================================
-- Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_leaves_updated_at ON leaves;
CREATE TRIGGER trg_leaves_updated_at
BEFORE UPDATE ON leaves
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leaves_audit ON leaves;
CREATE TRIGGER trg_leaves_audit
AFTER INSERT OR UPDATE OR DELETE ON leaves
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- CRUD Functions with Permission Checks
-- ============================================

-- INSERT
CREATE OR REPLACE FUNCTION insert_leave(
    _user_id BIGINT,_leave_type_id BIGINT,_start_date DATE,_end_date DATE,
    _reason TEXT,_document_url TEXT,_is_emergency BOOLEAN
) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
    PERFORM require_permission('leaves','insert');

    INSERT INTO leaves(
        school_id,user_id,leave_type_id,start_date,end_date,reason,
        document_url,status,applied_at,is_emergency,created_by
    )
    VALUES (
        current_school_id(),_user_id,_leave_type_id,_start_date,_end_date,_reason,
        _document_url,'pending',NOW(),COALESCE(_is_emergency,FALSE),current_user_id()
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE
CREATE OR REPLACE FUNCTION update_leave(
    _id BIGINT,_status TEXT,_approved_by BIGINT,_approved_at TIMESTAMPTZ,_reject_reason TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leaves','update');

    UPDATE leaves SET
        status = COALESCE(_status,status),
        approved_by = COALESCE(_approved_by,approved_by),
        approved_at = COALESCE(_approved_at,approved_at),
        reject_reason = COALESCE(_reject_reason,reject_reason),
        updated_at = NOW(),
        updated_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SOFT DELETE
CREATE OR REPLACE FUNCTION soft_delete_leave(_id BIGINT) RETURNS VOID AS $$
BEGIN
    PERFORM require_permission('leaves','delete');

    UPDATE leaves
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = current_user_id()
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT wrapper
CREATE OR REPLACE FUNCTION select_leave(_id BIGINT) RETURNS SETOF leaves AS $$
BEGIN
    PERFORM require_permission('leaves','view');

    RETURN QUERY
    SELECT *
    FROM leaves
    WHERE id = _id AND school_id = current_school_id() AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- LIST wrapper
CREATE OR REPLACE FUNCTION list_leaves(_start_date DATE,_end_date DATE) RETURNS SETOF leaves AS $$
BEGIN
    PERFORM require_permission('leaves','view');

    RETURN QUERY
    SELECT *
    FROM leaves
    WHERE school_id = current_school_id()
      AND start_date BETWEEN _start_date AND _end_date
      AND is_deleted = FALSE;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Reporting/Export Functions
-- ============================================

-- Report: summary counts
CREATE OR REPLACE FUNCTION report_leaves_summary(_start_date DATE,_end_date DATE) RETURNS TABLE (
    total_leaves BIGINT,
    approved_leaves BIGINT,
    rejected_leaves BIGINT,
    pending_leaves BIGINT
) AS $$
BEGIN
    PERFORM require_permission('leaves','view');

    RETURN QUERY
    SELECT COUNT(*) AS total_leaves,
           COUNT(*) FILTER (WHERE status = 'approved' AND is_deleted = FALSE) AS approved_leaves,
           COUNT(*) FILTER (WHERE status = 'rejected' AND is_deleted = FALSE) AS rejected_leaves,
           COUNT(*) FILTER (WHERE status = 'pending' AND is_deleted = FALSE) AS pending_leaves
    FROM leaves
    WHERE school_id = current_school_id()
      AND start_date BETWEEN _start_date AND _end_date;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grants
-- ============================================
GRANT SELECT,INSERT,UPDATE ON leaves TO authenticated;

GRANT EXECUTE ON FUNCTION insert_leave(BIGINT,BIGINT,DATE,DATE,TEXT,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_leave(BIGINT,TEXT,BIGINT,TIMESTAMPTZ,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_leave(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION select_leave(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_leaves(DATE,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION report_leaves_summary(DATE,DATE) TO authenticated;



-- ============================================
-- Bit 7/XX: report_attendance_summary (Dynamic Timeframe Reporting)
-- ============================================

CREATE OR REPLACE FUNCTION report_attendance_summary(
    _school_id BIGINT,
    _start_date DATE,
    _end_date DATE
) RETURNS TABLE (
    user_id BIGINT,
    user_name TEXT,
    attendance_date DATE,
    campus_sign_in TIMESTAMPTZ,
    campus_sign_out TIMESTAMPTZ,
    total_sessions INT,
    sessions_attended INT,
    sessions_missed INT,
    present_but_missed_classes BOOLEAN
) AS $$
BEGIN
    PERFORM require_permission('attendance_records','view');

    RETURN QUERY
    SELECT
        u.id AS user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        DATE(ar.recorded_at) AS attendance_date,

        -- Campus entry/exit
        MIN(CASE WHEN cal.event_type = 'sign_in' THEN cal.event_at END) AS campus_sign_in,
        MAX(CASE WHEN cal.event_type = 'sign_out' THEN cal.event_at END) AS campus_sign_out,

        -- Sessions
        COUNT(DISTINCT ar.session_id) AS total_sessions,
        COUNT(*) FILTER (WHERE ar.status IN ('P','L','E')) AS sessions_attended,
        COUNT(*) FILTER (WHERE ar.status = 'A') AS sessions_missed,

        -- Gap flag
        CASE
          WHEN MIN(CASE WHEN cal.event_type = 'sign_in' THEN cal.event_at END) IS NOT NULL
               AND COUNT(*) FILTER (WHERE ar.status = 'A') > 0
          THEN TRUE ELSE FALSE
        END AS present_but_missed_classes

    FROM users u
    LEFT JOIN campus_access_logs cal
      ON u.id = cal.user_id
     AND cal.school_id = _school_id
     AND cal.event_at::DATE BETWEEN _start_date AND _end_date
    LEFT JOIN attendance_records ar
      ON u.id = ar.user_id
     AND ar.school_id = _school_id
     AND ar.recorded_at::DATE BETWEEN _start_date AND _end_date
    GROUP BY u.id, u.first_name, u.last_name, DATE(ar.recorded_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Bit 8/XX: report_leaves_summary (Dynamic Timeframe Reporting)
-- ============================================

CREATE OR REPLACE FUNCTION report_leaves_summary(
    _school_id BIGINT,
    _start_date DATE,
    _end_date DATE
) RETURNS TABLE (
    user_id BIGINT,
    user_name TEXT,
    total_leaves BIGINT,
    approved_leaves BIGINT,
    rejected_leaves BIGINT,
    pending_leaves BIGINT,
    cancelled_leaves BIGINT,
    completed_leaves BIGINT,
    emergency_leaves BIGINT
) AS $$
BEGIN
    PERFORM require_permission('leaves','view');

    RETURN QUERY
    SELECT
        u.id AS user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        COUNT(*) AS total_leaves,
        COUNT(*) FILTER (WHERE l.status = 'approved' AND l.is_deleted = FALSE) AS approved_leaves,
        COUNT(*) FILTER (WHERE l.status = 'rejected' AND l.is_deleted = FALSE) AS rejected_leaves,
        COUNT(*) FILTER (WHERE l.status = 'pending' AND l.is_deleted = FALSE) AS pending_leaves,
        COUNT(*) FILTER (WHERE l.status = 'cancelled' AND l.is_deleted = FALSE) AS cancelled_leaves,
        COUNT(*) FILTER (WHERE l.status = 'completed' AND l.is_deleted = FALSE) AS completed_leaves,
        COUNT(*) FILTER (WHERE l.is_emergency = TRUE AND l.is_deleted = FALSE) AS emergency_leaves
    FROM leaves l
    JOIN users u ON u.id = l.user_id
    WHERE l.school_id = _school_id
      AND l.start_date BETWEEN _start_date AND _end_date
      AND l.is_deleted = FALSE
    GROUP BY u.id, u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Bit 9/XX: report_attendance_compliance (MoES 85% Eligibility Check)
-- ============================================

CREATE OR REPLACE FUNCTION report_attendance_compliance(
    _school_id BIGINT,
    _start_date DATE,
    _end_date DATE
) RETURNS TABLE (
    user_id BIGINT,
    user_name TEXT,
    total_sessions BIGINT,
    attended_sessions BIGINT,
    absent_sessions BIGINT,
    approved_leaves BIGINT,
    effective_attendance_percent NUMERIC(5,2),
    meets_moes_requirement BOOLEAN
) AS $$
BEGIN
    PERFORM require_permission('attendance_records','view');

    RETURN QUERY
    WITH sessions AS (
        SELECT ar.user_id,
               COUNT(*) AS total_sessions,
               COUNT(*) FILTER (WHERE ar.status IN ('P','L','E')) AS attended_sessions,
               COUNT(*) FILTER (WHERE ar.status = 'A') AS absent_sessions
        FROM attendance_records ar
        WHERE ar.school_id = _school_id
          AND ar.recorded_at::DATE BETWEEN _start_date AND _end_date
          AND ar.is_deleted = FALSE
        GROUP BY ar.user_id
    ),
    leaves AS (
        SELECT l.user_id,
               COUNT(*) AS approved_leaves
        FROM leaves l
        WHERE l.school_id = _school_id
          AND l.start_date BETWEEN _start_date AND _end_date
          AND l.status = 'approved'
          AND l.is_deleted = FALSE
        GROUP BY l.user_id
    )
    SELECT
        u.id AS user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        COALESCE(s.total_sessions,0) AS total_sessions,
        COALESCE(s.attended_sessions,0) AS attended_sessions,
        COALESCE(s.absent_sessions,0) AS absent_sessions,
        COALESCE(l.approved_leaves,0) AS approved_leaves,
        CASE 
            WHEN COALESCE(s.total_sessions,0) = 0 THEN 0
            ELSE ROUND(
                ((COALESCE(s.attended_sessions,0) + COALESCE(l.approved_leaves,0))::NUMERIC 
                 / COALESCE(s.total_sessions,1)) * 100,2
            )
        END AS effective_attendance_percent,
        CASE 
            WHEN COALESCE(s.total_sessions,0) = 0 THEN FALSE
            ELSE ((COALESCE(s.attended_sessions,0) + COALESCE(l.approved_leaves,0))::NUMERIC 
                  / COALESCE(s.total_sessions,1)) * 100 >= 85
        END AS meets_moes_requirement
    FROM users u
    LEFT JOIN sessions s ON u.id = s.user_id
    LEFT JOIN leaves l ON u.id = l.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
