-- ============================================
-- Admissions Domain - Complete Consolidated Migration
-- Includes: Applicants, Applications, Decisions, Enrollments, Interviews, Exam Sessions, Exam Definitions, Entrance Exams
-- ============================================

-- ============================================
-- PART 1: LOOKUP TABLES
-- ============================================

-- Admission Statuses (workflow stages)
CREATE TABLE IF NOT EXISTS admission_statuses (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_final BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT admission_statuses_unique_code UNIQUE (school_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS admission_statuses_school_code_idx ON admission_statuses(school_id, code);
CREATE INDEX IF NOT EXISTS idx_admission_statuses_school ON admission_statuses(school_id);

-- Application Types
CREATE TABLE IF NOT EXISTS application_types (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT application_types_unique_code UNIQUE (school_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS application_types_school_code_idx ON application_types(school_id, code);
CREATE INDEX IF NOT EXISTS idx_application_types_school ON application_types(school_id);

-- ============================================
-- PART 2: MAIN TABLES
-- ============================================

-- Applicants (Prospective students - before enrollment)
CREATE TABLE IF NOT EXISTS applicants (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    nationality VARCHAR(50) DEFAULT 'Ugandan',
    email VARCHAR(150),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(50),
    guardian_email VARCHAR(150),
    guardian_relationship VARCHAR(50),
    previous_school VARCHAR(200),
    previous_grade VARCHAR(50),
    leaving_certificate_no VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='applicants' AND policyname='applicants_isolation') THEN
        EXECUTE 'DROP POLICY applicants_isolation ON applicants';
    END IF;
END$$;

CREATE POLICY applicants_isolation ON applicants
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Applications (Formal admission applications)
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    applicant_id BIGINT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    application_type_id BIGINT REFERENCES application_types(id) ON DELETE SET NULL,
    admission_status_id BIGINT REFERENCES admission_statuses(id) ON DELETE SET NULL,
    applying_for_grade VARCHAR(50) NOT NULL,
    applying_for_stream VARCHAR(100),
    academic_year VARCHAR(20) NOT NULL,
    intended_start_date DATE,
    enquiry_id BIGINT,
    application_no VARCHAR(50),
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    review_date TIMESTAMPTZ,
    reviewed_by BIGINT,
    decision_date TIMESTAMPTZ,
    decision_notes TEXT,
    enrollment_date DATE,
    student_id BIGINT,
    decision_made_at TIMESTAMPTZ,
    decision_type VARCHAR(50),
    enrolled_student_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    CONSTRAINT applications_unique_no UNIQUE (school_id, application_no)
);

-- Foreign keys to students/enquiries handled at application level
-- (Database constraints removed to avoid migration ordering issues)

CREATE INDEX IF NOT EXISTS idx_applications_decision_type ON applications(decision_type);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='applications' AND policyname='applications_isolation') THEN
        EXECUTE 'DROP POLICY applications_isolation ON applications';
    END IF;
END$$;

CREATE POLICY applications_isolation ON applications
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Application Documents
DROP TABLE IF EXISTS application_documents CASCADE;
CREATE TABLE application_documents (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by BIGINT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE INDEX IF NOT EXISTS idx_application_documents_application ON application_documents(school_id, application_id);

-- Interviews
DROP TABLE IF EXISTS interviews CASCADE;
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interview_type VARCHAR(50) DEFAULT 'general',
    scheduled_date TIMESTAMPTZ NOT NULL,
    scheduled_end_time TIMESTAMPTZ,
    location VARCHAR(200),
    interviewer_ids BIGINT[],
    interview_notes TEXT,
    interview_score NUMERIC(5,2),
    interview_outcome VARCHAR(50),
    outcome_notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(school_id, application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(school_id, scheduled_date);

-- ============================================
-- PART 3: DECISIONS & ENROLLMENTS
-- ============================================

-- Application Decisions Table
DROP TABLE IF EXISTS application_decisions CASCADE;
CREATE TABLE application_decisions (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  decision_type VARCHAR(50) NOT NULL,
  decision_date TIMESTAMPTZ DEFAULT NOW(),
  decision_by BIGINT,
  offer_details JSONB,
  offer_valid_until DATE,
  waitlist_position INTEGER,
  waitlist_notes TEXT,
  rejection_reason TEXT,
  applicant_response VARCHAR(50),
  response_date TIMESTAMPTZ,
  response_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT application_decisions_unique_application UNIQUE (application_id),
  CONSTRAINT application_decisions_decision_type_check
    CHECK (decision_type IN ('offered', 'waitlisted', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_application_decisions_school ON application_decisions(school_id);
CREATE INDEX IF NOT EXISTS idx_application_decisions_application ON application_decisions(application_id);
CREATE INDEX IF NOT EXISTS idx_application_decisions_type ON application_decisions(decision_type);

-- Enrollments Table (from admissions)
DROP TABLE IF EXISTS enrollments CASCADE;
CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id BIGINT,
  enrollment_date DATE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  grade_id BIGINT,
  stream_id BIGINT,
  enrollment_status VARCHAR(50) DEFAULT 'pending',
  fees_category VARCHAR(50),
  documents_submitted JSONB DEFAULT '[]'::jsonb,
  fees_paid BOOLEAN DEFAULT FALSE,
  fees_amount NUMERIC(10,2),
  fees_receipt_no VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  completed_at TIMESTAMPTZ,
  completed_by BIGINT,
  CONSTRAINT enrollments_unique_application UNIQUE (application_id)
);

-- Foreign keys to students handled at application level
-- (Database constraints removed to avoid migration ordering issues)

CREATE INDEX IF NOT EXISTS idx_enrollments_school ON enrollments(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_application ON enrollments(application_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(enrollment_status);

-- Enable RLS for decisions and enrollments
ALTER TABLE application_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS decisions_isolation ON application_decisions;
  DROP POLICY IF EXISTS enrollments_isolation ON enrollments;

  CREATE POLICY decisions_isolation ON application_decisions
    FOR ALL TO authenticated
    USING (school_id = current_school_id())
    WITH CHECK (school_id = current_school_id());

  CREATE POLICY enrollments_isolation ON enrollments
    FOR ALL TO authenticated
    USING (school_id = current_school_id())
    WITH CHECK (school_id = current_school_id());
END $$;

-- ============================================
-- PART 4: EXAM MANAGEMENT
-- ============================================

-- Exam Sessions
CREATE TABLE IF NOT EXISTS exam_sessions (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_name VARCHAR(100) NOT NULL,
  session_code VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT,
  CONSTRAINT exam_sessions_unique_code UNIQUE (school_id, session_code)
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_school ON exam_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_dates ON exam_sessions(start_date, end_date);

-- Exam Definitions
CREATE TABLE IF NOT EXISTS exam_definitions (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  exam_name VARCHAR(200) NOT NULL,
  exam_code VARCHAR(50) NOT NULL,
  subject_area VARCHAR(100),
  total_marks INTEGER DEFAULT 100,
  duration_minutes INTEGER,
  description TEXT,
  grading_scale VARCHAR(50) DEFAULT 'A-F',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT,
  CONSTRAINT exam_definitions_unique_code UNIQUE (school_id, exam_code)
);

CREATE INDEX IF NOT EXISTS idx_exam_definitions_school ON exam_definitions(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_definitions_subject ON exam_definitions(subject_area);

-- Entrance Exams (Results)
DROP TABLE IF EXISTS entrance_exams CASCADE;
CREATE TABLE entrance_exams (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id BIGINT REFERENCES exam_sessions(id) ON DELETE SET NULL,
  exam_definition_id BIGINT REFERENCES exam_definitions(id) ON DELETE SET NULL,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  total_marks INTEGER NOT NULL,
  marks_obtained INTEGER NOT NULL,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_marks > 0 THEN (marks_obtained::NUMERIC / total_marks * 100) ELSE 0 END
  ) STORED,
  grade VARCHAR(10),
  supervisor_id BIGINT,
  supervisor_name VARCHAR(200),
  marker_id BIGINT,
  marker_name VARCHAR(200),
  examiner_id BIGINT,
  examiner_name VARCHAR(200),
  exam_venue VARCHAR(200),
  remarks TEXT,
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT
);

CREATE INDEX IF NOT EXISTS idx_entrance_exams_application ON entrance_exams(application_id);
CREATE INDEX IF NOT EXISTS idx_entrance_exams_session ON entrance_exams(session_id);
CREATE INDEX IF NOT EXISTS idx_entrance_exams_date ON entrance_exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_entrance_exams_school ON entrance_exams(school_id);
CREATE INDEX IF NOT EXISTS idx_entrance_exams_deleted ON entrance_exams(deleted_at) WHERE deleted_at IS NOT NULL;

-- Enable RLS for exam tables
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_sessions' AND policyname='sessions_isolation') THEN
    CREATE POLICY sessions_isolation ON exam_sessions
      FOR ALL TO authenticated
      USING (school_id = current_school_id())
      WITH CHECK (school_id = current_school_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_definitions' AND policyname='definitions_isolation') THEN
    CREATE POLICY definitions_isolation ON exam_definitions
      FOR ALL TO authenticated
      USING (school_id = current_school_id())
      WITH CHECK (school_id = current_school_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='entrance_exams' AND policyname='exams_isolation') THEN
    CREATE POLICY exams_isolation ON entrance_exams
      FOR ALL TO authenticated
      USING (school_id = current_school_id())
      WITH CHECK (school_id = current_school_id());
  END IF;
END $$;

-- ============================================
-- PART 5: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_applicants_school_name ON applicants(school_id, last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(school_id, email);
CREATE INDEX IF NOT EXISTS idx_applicants_phone ON applicants(school_id, phone);

CREATE INDEX IF NOT EXISTS idx_applications_school_status ON applications(school_id, admission_status_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(school_id, applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_enquiry ON applications(school_id, enquiry_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(school_id, submission_date DESC);

-- ============================================
-- PART 6: TRIGGERS
-- ============================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS trg_applicants_updated_at ON applicants;
CREATE TRIGGER trg_applicants_updated_at BEFORE UPDATE ON applicants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_application_documents_updated_at ON application_documents;
CREATE TRIGGER trg_application_documents_updated_at BEFORE UPDATE ON application_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_interviews_updated_at ON interviews;
CREATE TRIGGER trg_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_exam_sessions_updated ON exam_sessions;
CREATE TRIGGER trg_exam_sessions_updated BEFORE UPDATE ON exam_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_exam_definitions_updated ON exam_definitions;
CREATE TRIGGER trg_exam_definitions_updated BEFORE UPDATE ON exam_definitions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_entrance_exams_updated ON entrance_exams;
CREATE TRIGGER trg_entrance_exams_updated BEFORE UPDATE ON entrance_exams FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Audit triggers
DROP TRIGGER IF EXISTS trg_applicants_audit ON applicants;
CREATE TRIGGER trg_applicants_audit AFTER INSERT OR UPDATE OR DELETE ON applicants FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_applications_audit ON applications;
CREATE TRIGGER trg_applications_audit AFTER INSERT OR UPDATE OR DELETE ON applications FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_exam_sessions_audit ON exam_sessions;
CREATE TRIGGER trg_exam_sessions_audit AFTER INSERT OR UPDATE OR DELETE ON exam_sessions FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_exam_definitions_audit ON exam_definitions;
CREATE TRIGGER trg_exam_definitions_audit AFTER INSERT OR UPDATE OR DELETE ON exam_definitions FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_entrance_exams_audit ON entrance_exams;
CREATE TRIGGER trg_entrance_exams_audit AFTER INSERT OR UPDATE OR DELETE ON entrance_exams FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Auto-generate Application Number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_no IS NULL THEN
        NEW.application_no := 'APP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_number ON applications;
CREATE TRIGGER trg_application_number BEFORE INSERT ON applications FOR EACH ROW EXECUTE FUNCTION generate_application_number();

-- ============================================
-- PART 7: FUNCTIONS
-- ============================================

-- Admission statistics
CREATE OR REPLACE FUNCTION get_admission_stats(_school_id BIGINT, _academic_year VARCHAR DEFAULT NULL)
RETURNS TABLE (
    status_name VARCHAR,
    status_code VARCHAR,
    status_color VARCHAR,
    count BIGINT,
    percentage NUMERIC
) AS $$
DECLARE
    total_count BIGINT;
BEGIN
    SELECT COALESCE(COUNT(*), 0) INTO total_count
    FROM applications a
    WHERE a.school_id = _school_id
      AND a.is_deleted = FALSE
      AND (_academic_year IS NULL OR a.academic_year = _academic_year);

    RETURN QUERY
    SELECT
        COALESCE(ast.name, 'Unknown')::VARCHAR AS status_name,
        COALESCE(ast.code, 'unknown')::VARCHAR AS status_code,
        COALESCE(ast.color, '#6B7280')::VARCHAR AS status_color,
        COALESCE(COUNT(*), 0)::BIGINT AS count,
        CASE
            WHEN total_count > 0 THEN ROUND((COALESCE(COUNT(*), 0)::NUMERIC / total_count * 100), 2)
            ELSE 0
        END::NUMERIC AS percentage
    FROM applications a
    LEFT JOIN admission_statuses ast ON a.admission_status_id = ast.id
    WHERE a.school_id = _school_id
      AND a.is_deleted = FALSE
      AND (_academic_year IS NULL OR a.academic_year = _academic_year)
    GROUP BY ast.id, ast.name, ast.code, ast.color, total_count
    ORDER BY ast.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convert enquiry to application
CREATE OR REPLACE FUNCTION convert_enquiry_to_application(
    _enquiry_id BIGINT,
    _applicant_first_name VARCHAR,
    _applicant_last_name VARCHAR,
    _applicant_dob DATE,
    _grade_applying_for VARCHAR,
    _academic_year VARCHAR
) RETURNS BIGINT AS $$
DECLARE
    _applicant_id BIGINT;
    _application_id BIGINT;
    _school_id BIGINT;
BEGIN
    SELECT school_id INTO _school_id FROM enquiries WHERE id = _enquiry_id;

    INSERT INTO applicants (
        school_id, first_name, last_name, date_of_birth,
        email, phone, guardian_name, guardian_phone, created_by
    )
    SELECT
        e.school_id, e.enquirer_name, '', NOW(),
        e.enquirer_email, e.enquirer_phone, e.enquirer_name, e.enquirer_phone, e.created_by
    FROM enquiries e WHERE e.id = _enquiry_id
    RETURNING id INTO _applicant_id;

    INSERT INTO applications (
        school_id, applicant_id, enquiry_id, applying_for_grade, academic_year, created_by
    )
    VALUES (
        _school_id, _applicant_id, _enquiry_id, _grade_applying_for, _academic_year,
        (SELECT created_by FROM enquiries WHERE id = _enquiry_id)
    )
    RETURNING id INTO _application_id;

    UPDATE enquiries SET status = 'converted', resolved_date = NOW(),
        resolution_notes = 'Converted to application #' || _application_id
    WHERE id = _enquiry_id;

    RETURN _application_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 8: SEED DATA
-- ============================================

-- Seed admission_statuses for all schools
INSERT INTO admission_statuses (school_id, name, code, description, color, display_order, is_final)
SELECT
  s.id, v.name, v.code, v.description, v.color, v.display_order, v.is_final
FROM schools s
CROSS JOIN (VALUES
  ('Applied', 'APPLIED', 'Application submitted', '#3B82F6', 1, FALSE),
  ('Under Review', 'UNDER_REVIEW', 'Being reviewed by admissions team', '#F59E0B', 2, FALSE),
  ('Interview Scheduled', 'INTERVIEW_SCHEDULED', 'Interview has been scheduled', '#8B5CF6', 3, FALSE),
  ('Interviewed', 'INTERVIEWED', 'Interview completed', '#6B7280', 4, FALSE),
  ('Offered', 'OFFERED', 'Admission offer made', '#10B981', 5, FALSE),
  ('Waitlisted', 'WAITLISTED', 'On waiting list', '#EC4899', 6, FALSE),
  ('Rejected', 'REJECTED', 'Application rejected', '#EF4444', 7, TRUE),
  ('Enrolled', 'ENROLLED', 'Student has enrolled', '#059669', 8, TRUE),
  ('Withdrawn', 'WITHDRAWN', 'Application withdrawn', '#6B7280', 9, TRUE)
) AS v(name, code, description, color, display_order, is_final)
WHERE s.is_active = true
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, color = EXCLUDED.color,
  display_order = EXCLUDED.display_order, is_final = EXCLUDED.is_final, updated_at = NOW();

-- Seed application_types for all schools
INSERT INTO application_types (school_id, name, code, description, is_active)
SELECT
  s.id, v.name, v.code, v.description, v.is_active
FROM schools s
CROSS JOIN (VALUES
  ('New Student', 'NEW', 'First-time applicant', TRUE),
  ('Transfer Student', 'TRANSFER', 'Transferring from another school', TRUE),
  ('Returning Student', 'RETURNING', 'Re-enrolling after break', TRUE),
  ('Upgrade', 'UPGRADE', 'Moving to higher grade', TRUE),
  ('Boarding', 'BOARDING', 'Boarding student application', TRUE),
  ('Day Scholar', 'DAY', 'Day student application', TRUE)
) AS v(name, code, description, is_active)
WHERE s.is_active = true
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, is_active = EXCLUDED.is_active, updated_at = NOW();

-- Verify seed data
DO $$
DECLARE
  v_count INTEGER;
  v_school_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_school_count FROM schools WHERE is_active = true;

  SELECT COUNT(*) INTO v_count FROM admission_statuses;
  RAISE NOTICE '✅ Seeded % admission_statuses records for % schools', v_count, v_school_count;

  SELECT COUNT(*) INTO v_count FROM application_types;
  RAISE NOTICE '✅ Seeded % application_types records for % schools', v_count, v_school_count;
END $$;

-- ============================================
-- PART 9: COMMENTS
-- ============================================

COMMENT ON TABLE applicants IS 'Prospective students before enrollment';
COMMENT ON TABLE applications IS 'Formal admission applications';
COMMENT ON TABLE admission_statuses IS 'Workflow stages for applications';
COMMENT ON TABLE application_types IS 'Types of applications (New, Transfer, etc.)';
COMMENT ON TABLE application_documents IS 'Documents uploaded with applications';
COMMENT ON TABLE interviews IS 'Scheduled admission interviews';
COMMENT ON TABLE application_decisions IS 'Records admission decisions (offers, waitlists, rejections)';
COMMENT ON TABLE enrollments IS 'Links accepted applications to student records';
COMMENT ON TABLE exam_sessions IS 'Exam sessions/batches (e.g., "2026 March Entrance Exams")';
COMMENT ON TABLE exam_definitions IS 'Exam definitions (e.g., "Mathematics Paper 1")';
COMMENT ON TABLE entrance_exams IS 'Student exam results';
COMMENT ON COLUMN applications.enquiry_id IS 'Links to original enquiry if converted';
COMMENT ON COLUMN applications.student_id IS 'Links to student record if enrolled';
COMMENT ON COLUMN application_decisions.offer_details IS 'JSON: {grade_offered, stream_offered, academic_year, fees_category}';
COMMENT ON COLUMN enrollments.documents_submitted IS 'Array of submitted document names';
COMMENT ON COLUMN enrollments.enrollment_status IS 'pending_confirmation, completed';
COMMENT ON COLUMN entrance_exams.session_id IS 'Links to exam session/batch';
COMMENT ON COLUMN entrance_exams.exam_definition_id IS 'Links to exam definition/subject';
COMMENT ON COLUMN entrance_exams.supervisor_id IS 'Staff who supervised/invigilated the exam';
COMMENT ON COLUMN entrance_exams.marker_id IS 'Staff who marked the exam script';
COMMENT ON COLUMN entrance_exams.examiner_id IS 'Chief examiner responsible for the exam';
COMMENT ON COLUMN entrance_exams.moderation_notes IS 'Notes from second marking/moderation';
COMMENT ON FUNCTION convert_enquiry_to_application IS 'Converts an enquiry into an application';
