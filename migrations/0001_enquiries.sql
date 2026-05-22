-- ============================================
-- Enquiries Management System - Simplified
-- Clean schema with only essential tables
-- ============================================

-- ============================================
-- PART 1: LOOKUP TABLES
-- ============================================

-- Enquiry Categories (WHAT they're enquiring about)
-- Replaces both enquiry_types and enquiry_subjects
CREATE TABLE IF NOT EXISTS enquiry_categories (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES enquiry_categories(id) ON DELETE SET NULL,
    color VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT enquiry_categories_unique_code UNIQUE (school_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS enquiry_categories_school_code_idx ON enquiry_categories(school_id, code);
CREATE INDEX IF NOT EXISTS idx_enquiry_categories_school ON enquiry_categories(school_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_categories_parent ON enquiry_categories(parent_id);

-- Enquirer Categories (WHO is enquiring)
-- Existing_Parent, Potential_Parent, Existing_Student, Potential_Student, Vendor, BoardMember, etc.
CREATE TABLE IF NOT EXISTS enquirer_categories (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    requires_user_id BOOLEAN DEFAULT FALSE,  -- TRUE if they need to login (existing users)
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT enquirer_categories_unique_code UNIQUE (school_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS enquirer_categories_school_code_idx ON enquirer_categories(school_id, code);
CREATE INDEX IF NOT EXISTS idx_enquirer_categories_school ON enquirer_categories(school_id);

-- Enquiry Sources (WHERE enquiry came from)
-- Simple lookup for tracking, can be extended per school
CREATE TABLE IF NOT EXISTS enquiry_sources (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT enquiry_sources_unique_code UNIQUE (school_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS enquiry_sources_school_code_idx ON enquiry_sources(school_id, code);
CREATE INDEX IF NOT EXISTS idx_enquiry_sources_school ON enquiry_sources(school_id);

-- ============================================
-- PART 2: MAIN ENQUIRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

    -- Classification
    enquiry_category_id BIGINT REFERENCES enquiry_categories(id) ON DELETE SET NULL,
    enquirer_category_id BIGINT REFERENCES enquirer_categories(id) ON DELETE SET NULL,
    enquiry_source_id BIGINT REFERENCES enquiry_sources(id) ON DELETE SET NULL,

    -- Status & Priority (ENUMs - fixed values)
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_response', 'converted', 'closed', 'rejected')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Subject & Description
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    -- Enquirer Details
    enquirer_name VARCHAR(200) NOT NULL,
    enquirer_email VARCHAR(150),
    enquirer_phone VARCHAR(50),
    enquirer_address TEXT,
    enquirer_city VARCHAR(100),
    enquirer_state VARCHAR(100),
    enquirer_postal_code VARCHAR(20),
    
    -- Link to existing user (if applicable)
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- For existing parents/students/staff

    -- Academic Interest (if applicable)
    interested_grade VARCHAR(50),
    interested_stream VARCHAR(100),
    academic_year VARCHAR(20),

    -- Assignment & Tracking
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Follow-up & Resolution
    follow_up_date DATE,
    follow_up_notes TEXT,
    resolved_date TIMESTAMPTZ,
    resolved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    rejection_reason TEXT,

    -- Relationships
    student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,  -- If converted to student
    staff_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,

    -- Reference & Tracking
    reference_no VARCHAR(50),
    enquiry_date TIMESTAMPTZ DEFAULT NOW(),
    last_contact_date TIMESTAMPTZ,
    next_action TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='enquiries' AND policyname='enquiries_isolation'
    ) THEN
        EXECUTE 'DROP POLICY enquiries_isolation ON enquiries';
    END IF;
END$$;

CREATE POLICY enquiries_isolation ON enquiries
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- PART 3: ENQUIRY NOTES (Child Table)
-- ============================================

CREATE TABLE IF NOT EXISTS enquiry_notes (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    enquiry_id BIGINT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general',  -- general, follow_up, internal, system
    is_private BOOLEAN DEFAULT FALSE,  -- Internal notes not visible to enquirer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE
);

ALTER TABLE enquiry_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='enquiry_notes' AND policyname='enquiry_notes_isolation'
    ) THEN
        EXECUTE 'DROP POLICY enquiry_notes_isolation ON enquiry_notes';
    END IF;
END$$;

CREATE POLICY enquiry_notes_isolation ON enquiry_notes
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- ============================================
-- PART 4: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_enquiries_school_status ON enquiries(school_id, status);
CREATE INDEX IF NOT EXISTS idx_enquiries_school_date ON enquiries(school_id, enquiry_date DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_to ON enquiries(school_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_enquiries_enquirer_email ON enquiries(school_id, enquirer_email);
CREATE INDEX IF NOT EXISTS idx_enquiries_enquirer_phone ON enquiries(school_id, enquirer_phone);
CREATE INDEX IF NOT EXISTS idx_enquiries_user ON enquiries(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_student ON enquiries(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_category ON enquiries(school_id, enquiry_category_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_enquirer_category ON enquiries(school_id, enquirer_category_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_source ON enquiries(school_id, enquiry_source_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_follow_up ON enquiries(school_id, follow_up_date) WHERE status NOT IN ('closed', 'rejected');

CREATE INDEX IF NOT EXISTS idx_enquiry_notes_enquiry ON enquiry_notes(school_id, enquiry_id);

-- ============================================
-- PART 5: TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS trg_enquiries_updated_at ON enquiries;
CREATE TRIGGER trg_enquiries_updated_at
BEFORE UPDATE ON enquiries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_enquiries_audit ON enquiries;
CREATE TRIGGER trg_enquiries_audit
AFTER INSERT OR UPDATE OR DELETE ON enquiries
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS trg_enquiry_notes_updated_at ON enquiry_notes;
CREATE TRIGGER trg_enquiry_notes_updated_at
BEFORE UPDATE ON enquiry_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- PART 6: FUNCTIONS
-- ============================================

-- Auto-generate Reference Number
CREATE OR REPLACE FUNCTION generate_enquiry_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_no IS NULL THEN
        NEW.reference_no := 'ENQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enquiry_reference ON enquiries;
CREATE TRIGGER trg_enquiry_reference
BEFORE INSERT ON enquiries
FOR EACH ROW EXECUTE FUNCTION generate_enquiry_reference();

-- Get enquiry statistics
CREATE OR REPLACE FUNCTION get_enquiry_stats(_school_id BIGINT, _date_from DATE DEFAULT NULL, _date_to DATE DEFAULT NULL)
RETURNS TABLE (
    status VARCHAR,
    count BIGINT,
    converted_count BIGINT,
    avg_resolution_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.status,
        COUNT(*) FILTER (WHERE e.status = e.status) AS count,
        COUNT(*) FILTER (WHERE e.status = 'converted') AS converted_count,
        AVG(EXTRACT(EPOCH FROM (e.resolved_date - e.enquiry_date)) / 86400) FILTER (WHERE e.resolved_date IS NOT NULL) AS avg_resolution_days
    FROM enquiries e
    WHERE e.school_id = _school_id
      AND e.is_deleted = FALSE
      AND (_date_from IS NULL OR e.enquiry_date >= _date_from)
      AND (_date_to IS NULL OR e.enquiry_date <= _date_to)
    GROUP BY e.status;
END;
$$ LANGUAGE plpgsql;

-- Convert enquiry to student
CREATE OR REPLACE FUNCTION convert_enquiry_to_student(
    _enquiry_id BIGINT,
    _student_id BIGINT
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE enquiries
    SET
        status = 'converted',
        student_id = _student_id,
        resolved_date = NOW(),
        updated_at = NOW()
    WHERE id = _enquiry_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 7: SEED DATA
-- ============================================

DO $$
DECLARE
  v_school_id BIGINT;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE is_active = true LIMIT 1;
  
  IF v_school_id IS NULL THEN
    RAISE NOTICE 'No active school found. Skipping seed data.';
    RETURN;
  END IF;

  -- Enquiry Categories (WHAT - hierarchical)
  INSERT INTO enquiry_categories (school_id, name, code, description, parent_id, display_order, color)
  VALUES
    (v_school_id, 'Academic', 'ACADEMIC', 'Academic related enquiries', null, 1, '#3B82F6'),
    (v_school_id, 'Admission Process', 'ADMISSION_PROC', 'Questions about admission procedure', 1, 1, null),
    (v_school_id, 'Curriculum', 'CURRICULUM', 'Questions about curriculum', 1, 2, null),
    (v_school_id, 'Examinations', 'EXAMINATIONS', 'Questions about exams', 1, 3, null),
    
    (v_school_id, 'Fees', 'FEES', 'Fee related enquiries', null, 2, '#F59E0B'),
    (v_school_id, 'Fee Structure', 'FEE_STRUCTURE', 'Questions about fee structure', 5, 1, null),
    (v_school_id, 'Payment Plans', 'PAYMENT_PLANS', 'Questions about payment options', 5, 2, null),
    (v_school_id, 'Scholarships', 'SCHOLARSHIPS', 'Scholarship enquiries', 5, 3, null),
    
    (v_school_id, 'Transport', 'TRANSPORT', 'Transport related enquiries', null, 3, '#8B5CF6'),
    (v_school_id, 'Bus Routes', 'BUS_ROUTES', 'Questions about bus routes', 9, 1, null),
    (v_school_id, 'Transport Fees', 'TRANSPORT_FEES', 'Questions about transport fees', 9, 2, null),
    
    (v_school_id, 'Boarding', 'BOARDING', 'Boarding related enquiries', null, 4, '#EC4899'),
    (v_school_id, 'Hostel Facilities', 'HOSTEL_FACILITIES', 'Questions about hostel', 12, 1, null),
    (v_school_id, 'Boarding Fees', 'BOARDING_FEES', 'Questions about boarding fees', 12, 2, null),
    
    (v_school_id, 'General', 'GENERAL', 'General enquiries', null, 5, '#6B7280'),
    (v_school_id, 'General Inquiry', 'GENERAL_INQUIRY', 'General inquiry - anything not specific', 15, 1, null),
    (v_school_id, 'School Policies', 'POLICIES', 'Questions about policies', 15, 2, null),
    (v_school_id, 'Extracurricular', 'EXTRACURRICULAR', 'Questions about activities', 15, 3, null),
    
    (v_school_id, 'Complaints', 'COMPLAINTS', 'Complaints', null, 6, '#EF4444'),
    (v_school_id, 'Suggestions', 'SUGGESTIONS', 'Suggestions for improvement', null, 7, '#14B8A6')
  ON CONFLICT (school_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order,
    color = EXCLUDED.color;

  -- Enquirer Categories (WHO)
  INSERT INTO enquirer_categories (school_id, name, code, description, requires_user_id, display_order)
  VALUES
    (v_school_id, 'Existing Parent', 'EXISTING_PARENT', 'Current parent of enrolled student', true, 1),
    (v_school_id, 'Potential Parent', 'POTENTIAL_PARENT', 'Prospective parent', false, 2),
    (v_school_id, 'Existing Student', 'EXISTING_STUDENT', 'Currently enrolled student', true, 3),
    (v_school_id, 'Potential Student', 'POTENTIAL_STUDENT', 'Prospective student', false, 4),
    (v_school_id, 'Vendor', 'VENDOR', 'Service provider/supplier', false, 5),
    (v_school_id, 'Board Member', 'BOARD_MEMBER', 'School board member', true, 6),
    (v_school_id, 'Staff', 'STAFF', 'School staff member', true, 7),
    (v_school_id, 'Alumni', 'ALUMNI', 'Former student', false, 8),
    (v_school_id, 'External Visitor', 'EXTERNAL_VISITOR', 'General external enquiry', false, 9)
  ON CONFLICT (school_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    requires_user_id = EXCLUDED.requires_user_id,
    display_order = EXCLUDED.display_order;

  -- Enquiry Sources (WHERE)
  INSERT INTO enquiry_sources (school_id, name, code, description, is_active)
  VALUES
    (v_school_id, 'Website', 'WEB', 'Enquiry through school website', true),
    (v_school_id, 'Phone Call', 'PHONE', 'Enquiry through phone call', true),
    (v_school_id, 'Walk-in', 'WALKIN', 'In-person visit', true),
    (v_school_id, 'Email', 'EMAIL', 'Enquiry through email', true),
    (v_school_id, 'Social Media', 'SOCIAL', 'Facebook, Instagram, etc.', true),
    (v_school_id, 'Referral', 'REFERRAL', 'Referred by existing parent/student', true),
    (v_school_id, 'Education Fair', 'FAIR', 'Education fair/event', true),
    (v_school_id, 'Advertisement', 'ADVERT', 'Response to advertisement', true)
  ON CONFLICT (school_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

  RAISE NOTICE 'Seed data inserted for school_id: %', v_school_id;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE enquiries IS 'Main enquiry tracking table';
COMMENT ON TABLE enquiry_categories IS 'Categories of enquiries (WHAT - hierarchical)';
COMMENT ON TABLE enquirer_categories IS 'Categories of enquirers (WHO - Existing/Potential Parent, Student, etc.)';
COMMENT ON TABLE enquiry_sources IS 'Sources of enquiries (WHERE - Web, Phone, Walk-in, etc.)';
COMMENT ON TABLE enquiry_notes IS 'Notes and comments on enquiries (conversation history)';
COMMENT ON COLUMN enquiries.user_id IS 'Links to existing user if enquirer is registered (parent, student, staff)';
COMMENT ON COLUMN enquirer_categories.requires_user_id IS 'TRUE if enquirer must be logged in (existing users)';
