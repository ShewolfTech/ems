-- ============================================
-- ASSESSMENT CONDUCTORS - Track multiple staff conducting an assessment
-- ============================================
-- Drop the single teacher_id column and create a junction table

-- Step 1: Drop single teacher_id if exists (CASCADE for dependent views)
ALTER TABLE assessments DROP COLUMN IF EXISTS teacher_id CASCADE;

-- Step 2: Create junction table for multiple conductors
CREATE TABLE IF NOT EXISTS assessment_conductors (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'invigilator',  -- lead, invigilator, assistant, coordinator
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    UNIQUE(assessment_id, staff_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_assessment_conductors_assessment ON assessment_conductors(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_conductors_staff ON assessment_conductors(staff_id);

-- RLS
ALTER TABLE assessment_conductors ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='assessment_conductors' AND policyname='assessment_conductors_isolation'
    ) THEN
        EXECUTE 'DROP POLICY assessment_conductors_isolation ON assessment_conductors';
    END IF;
END$$;

CREATE POLICY assessment_conductors_isolation ON assessment_conductors
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_conductors.assessment_id
              AND a.school_id = current_setting('app.current_school_id', true)::BIGINT
              AND a.is_deleted = FALSE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_conductors.assessment_id
              AND a.school_id = current_setting('app.current_school_id', true)::BIGINT
        )
    );

COMMENT ON TABLE assessment_conductors IS 'Tracks which staff members conduct/invigilate each assessment';
COMMENT ON COLUMN assessment_conductors.role IS 'Role in assessment: lead, invigilator, assistant, coordinator';
