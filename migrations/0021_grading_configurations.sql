-- ============================================
-- Migration 0021: Grading Configurations
-- ============================================
-- Purpose:
-- Allows each school to define its own grade aggregation rules
-- including category weights, grade scales, and calculation methods
-- ============================================

-- Step 1: Create grading_configurations table
CREATE TABLE IF NOT EXISTS grading_configurations (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Category Weights (must sum to 100.0)
    assessments_weight NUMERIC(5,2) DEFAULT 40.0 CHECK (assessments_weight >= 0 AND assessments_weight <= 100),
    exams_weight NUMERIC(5,2) DEFAULT 40.0 CHECK (exams_weight >= 0 AND exams_weight <= 100),
    assignments_weight NUMERIC(5,2) DEFAULT 20.0 CHECK (assignments_weight >= 0 AND assignments_weight <= 100),
    
    -- Grading Scale (JSONB array)
    -- Example: [
    --   {"grade": "A+", "min_percentage": 97, "max_percentage": 100, "grade_point": 5.0, "description": "Exceptional"},
    --   {"grade": "A", "min_percentage": 93, "max_percentage": 96.99, "grade_point": 5.0, "description": "Outstanding"},
    --   ...
    -- ]
    grading_scale JSONB NOT NULL DEFAULT '[]'::JSONB,
    
    -- Calculation Method
    calculation_method VARCHAR(50) DEFAULT 'weighted_average' CHECK (calculation_method IN ('weighted_average', 'total_points', 'category_average')),
    
    -- Settings
    round_final_grade BOOLEAN DEFAULT TRUE,
    decimal_places INT DEFAULT 1 CHECK (decimal_places >= 0 AND decimal_places <= 2),
    include_ungraded BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE, -- Only one default per school
    effective_start_date DATE,
    effective_end_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

-- Step 2: Add comments
COMMENT ON TABLE grading_configurations IS 'School-specific grading configuration with category weights and grade scales';
COMMENT ON COLUMN grading_configurations.assessments_weight IS 'Percentage weight for assessments in final grade (0-100)';
COMMENT ON COLUMN grading_configurations.exams_weight IS 'Percentage weight for exams in final grade (0-100)';
COMMENT ON COLUMN grading_configurations.assignments_weight IS 'Percentage weight for assignments in final grade (0-100)';
COMMENT ON COLUMN grading_configurations.grading_scale IS 'JSON array defining grade boundaries, points, and descriptions';
COMMENT ON COLUMN grading_configurations.calculation_method IS 'Method: weighted_average, total_points, or category_average';

-- Step 3: Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_grading_configs_unique_name 
ON grading_configurations(school_id, name) 
WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_grading_configs_school 
ON grading_configurations(school_id) 
WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_grading_configs_active 
ON grading_configurations(school_id, is_active, is_default) 
WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_grading_configs_year 
ON grading_configurations(school_id, academic_year_id) 
WHERE is_deleted = FALSE;

-- Step 4: Create function to validate weights sum to 100
CREATE OR REPLACE FUNCTION validate_grading_weights()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.assessments_weight + NEW.exams_weight + NEW.assignments_weight) != 100.0 THEN
        RAISE EXCEPTION 'Category weights must sum to 100.0. Current sum: %', 
            NEW.assessment_weight + NEW.exams_weight + NEW.assignments_weight;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger for weight validation
DROP TRIGGER IF EXISTS trg_validate_weights ON grading_configurations;
CREATE TRIGGER trg_validate_weights
    BEFORE INSERT OR UPDATE ON grading_configurations
    FOR EACH ROW
    EXECUTE FUNCTION validate_grading_weights();

-- Step 6: Create function to ensure only one default per school
CREATE OR REPLACE FUNCTION enforce_single_default()
RETURNS TRIGGER AS $$
BEGIN
    -- If this config is being set as default, unset others
    IF NEW.is_default = TRUE THEN
        UPDATE grading_configurations
        SET is_default = FALSE,
            updated_at = NOW(),
            updated_by = NEW.updated_by
        WHERE school_id = NEW.school_id
          AND id != NEW.id
          AND is_default = TRUE
          AND is_deleted = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for single default
DROP TRIGGER IF EXISTS trg_single_default ON grading_configurations;
CREATE TRIGGER trg_single_default
    BEFORE INSERT OR UPDATE ON grading_configurations
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_default();

-- Step 8: RLS
ALTER TABLE grading_configurations ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='grading_configurations' AND policyname='grading_configs_isolation'
    ) THEN
        EXECUTE 'DROP POLICY grading_configs_isolation ON grading_configurations';
    END IF;
END$$;

CREATE POLICY grading_configs_isolation ON grading_configurations
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

-- Step 9: Triggers for audit
DROP TRIGGER IF EXISTS trg_grading_configs_updated_at ON grading_configurations;
CREATE TRIGGER trg_grading_configs_updated_at
    BEFORE UPDATE ON grading_configurations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_grading_configs_audit ON grading_configurations;
CREATE TRIGGER trg_grading_configs_audit
    AFTER INSERT OR UPDATE OR DELETE ON grading_configurations
    FOR EACH ROW
    EXECUTE FUNCTION log_audit();

-- Step 10: Sample configurations (COMMENTED OUT - Create via UI instead)
-- To create configurations, navigate to /academics/grading-configurations
-- The UI provides templates for Standard (40/40/20), Exam-Focused (20/60/20),
-- and Continuous Assessment (50/30/20).

-- If you want to insert sample data manually, uncomment and replace school_id with your actual school ID:
/*
INSERT INTO grading_configurations (
    school_id, name, description,
    assessments_weight, exams_weight, assignments_weight,
    grading_scale,
    calculation_method,
    round_final_grade,
    decimal_places,
    is_active,
    is_default,
    effective_start_date
) VALUES (
    1, -- <-- REPLACE with your actual school_id
    'Standard Grading',
    'Balanced assessment approach with equal weight on assessments and exams',
    40.0, 40.0, 20.0,
    '[
        {"grade": "A+", "min_percentage": 97, "max_percentage": 100, "grade_point": 5.0, "description": "Exceptional"},
        {"grade": "A", "min_percentage": 93, "max_percentage": 96.99, "grade_point": 5.0, "description": "Outstanding"},
        {"grade": "A-", "min_percentage": 90, "max_percentage": 92.99, "grade_point": 4.7, "description": "Excellent"},
        {"grade": "B+", "min_percentage": 87, "max_percentage": 89.99, "grade_point": 4.3, "description": "Very Good Plus"},
        {"grade": "B", "min_percentage": 83, "max_percentage": 86.99, "grade_point": 4.0, "description": "Very Good"},
        {"grade": "B-", "min_percentage": 80, "max_percentage": 82.99, "grade_point": 3.7, "description": "Good Plus"},
        {"grade": "C+", "min_percentage": 77, "max_percentage": 79.99, "grade_point": 3.3, "description": "Above Average"},
        {"grade": "C", "min_percentage": 73, "max_percentage": 76.99, "grade_point": 3.0, "description": "Average"},
        {"grade": "C-", "min_percentage": 70, "max_percentage": 72.99, "grade_point": 2.7, "description": "Below Average"},
        {"grade": "D+", "min_percentage": 67, "max_percentage": 69.99, "grade_point": 2.3, "description": "Passing Plus"},
        {"grade": "D", "min_percentage": 63, "max_percentage": 66.99, "grade_point": 2.0, "description": "Passing"},
        {"grade": "D-", "min_percentage": 60, "max_percentage": 62.99, "grade_point": 1.7, "description": "Minimal Pass"},
        {"grade": "F", "min_percentage": 0, "max_percentage": 59.99, "grade_point": 0.0, "description": "Failing"}
    ]'::JSONB,
    'weighted_average',
    TRUE,
    1,
    TRUE,
    TRUE,
    CURRENT_DATE
) ON CONFLICT DO NOTHING;

INSERT INTO grading_configurations (
    school_id, name, description,
    assessments_weight, exams_weight, assignments_weight,
    grading_scale,
    calculation_method,
    round_final_grade,
    decimal_places,
    is_active,
    is_default,
    effective_start_date
) VALUES (
    1, -- <-- REPLACE with your actual school_id
    'Exam-Focused Grading',
    'Heavy emphasis on examinations with lighter continuous assessment',
    20.0, 60.0, 20.0,
    '[
        {"grade": "A", "min_percentage": 90, "max_percentage": 100, "grade_point": 5.0, "description": "Distinction"},
        {"grade": "B", "min_percentage": 80, "max_percentage": 89.99, "grade_point": 4.0, "description": "Very Good"},
        {"grade": "C", "min_percentage": 70, "max_percentage": 79.99, "grade_point": 3.0, "description": "Good"},
        {"grade": "D", "min_percentage": 60, "max_percentage": 69.99, "grade_point": 2.0, "description": "Satisfactory"},
        {"grade": "E", "min_percentage": 50, "max_percentage": 59.99, "grade_point": 1.0, "description": "Pass"},
        {"grade": "F", "min_percentage": 0, "max_percentage": 49.99, "grade_point": 0.0, "description": "Fail"}
    ]'::JSONB,
    'weighted_average',
    TRUE,
    1,
    TRUE,
    FALSE,
    CURRENT_DATE
) ON CONFLICT DO NOTHING;

INSERT INTO grading_configurations (
    school_id, name, description,
    assessments_weight, exams_weight, assignments_weight,
    grading_scale,
    calculation_method,
    round_final_grade,
    decimal_places,
    is_active,
    is_default,
    effective_start_date
) VALUES (
    1, -- <-- REPLACE with your actual school_id
    'Continuous Assessment Focus',
    'Emphasis on ongoing assessments with lighter final exams',
    50.0, 30.0, 20.0,
    '[
        {"grade": "1", "min_percentage": 90, "max_percentage": 100, "grade_point": 5.0, "description": "Highest Achievement"},
        {"grade": "2", "min_percentage": 80, "max_percentage": 89.99, "grade_point": 4.0, "description": "High Achievement"},
        {"grade": "3", "min_percentage": 70, "max_percentage": 79.99, "grade_point": 3.0, "description": "Substantial Achievement"},
        {"grade": "4", "min_percentage": 60, "max_percentage": 69.99, "grade_point": 2.0, "description": "Moderate Achievement"},
        {"grade": "5", "min_percentage": 50, "max_percentage": 59.99, "grade_point": 1.0, "description": "Elementary Achievement"},
        {"grade": "6", "min_percentage": 40, "max_percentage": 49.99, "grade_point": 0.5, "description": "Not Achieved"},
        {"grade": "7", "min_percentage": 0, "max_percentage": 39.99, "grade_point": 0.0, "description": "Not Achieved"}
    ]'::JSONB,
    'weighted_average',
    TRUE,
    1,
    TRUE,
    FALSE,
    CURRENT_DATE
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- Verification Queries
-- ============================================
-- Check table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'grading_configurations';

-- Check sample configurations
-- SELECT id, name, assessments_weight, exams_weight, assignments_weight, is_default 
-- FROM grading_configurations 
-- WHERE is_deleted = FALSE;

-- Check weights sum to 100
-- SELECT id, name, 
--        (assessments_weight + exams_weight + assignments_weight) as total_weight
-- FROM grading_configurations 
-- WHERE is_deleted = FALSE;
