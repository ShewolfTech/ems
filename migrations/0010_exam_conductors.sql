-- ============================================
-- EXAM CONDUCTORS - Track multiple staff conducting an exam
-- ============================================

-- Create junction table for exam conductors
CREATE TABLE IF NOT EXISTS exam_conductors (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'invigilator',  -- lead, invigilator, assistant, supervisor, team member, coordinator
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    UNIQUE(exam_id, staff_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_exam_conductors_exam ON exam_conductors(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_conductors_staff ON exam_conductors(staff_id);

-- RLS
ALTER TABLE exam_conductors ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='exam_conductors' AND policyname='exam_conductors_isolation'
    ) THEN
        EXECUTE 'DROP POLICY exam_conductors_isolation ON exam_conductors';
    END IF;
END$$;

CREATE POLICY exam_conductors_isolation ON exam_conductors
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM exams e
            WHERE e.id = exam_conductors.exam_id
              AND e.school_id = current_setting('app.current_school_id', true)::BIGINT
              AND e.is_deleted = FALSE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exams e
            WHERE e.id = exam_conductors.exam_id
              AND e.school_id = current_setting('app.current_school_id', true)::BIGINT
        )
    );

COMMENT ON TABLE exam_conductors IS 'Tracks which staff members conduct/invigilate each exam';
COMMENT ON COLUMN exam_conductors.role IS 'Role in exam: lead, invigilator, assistant, supervisor, team member, coordinator';
