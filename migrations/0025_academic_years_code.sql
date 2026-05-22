-- Add code column to academic_years if it doesn't exist
-- This ensures consistency with 0003_academics.sql schema

ALTER TABLE academic_years ADD COLUMN IF NOT EXISTS code VARCHAR(20);

-- Add unique constraint on code if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'academic_years_school_id_code_key'
  ) THEN
    ALTER TABLE academic_years ADD CONSTRAINT academic_years_school_id_code_key UNIQUE (school_id, code);
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN academic_years.code IS 'Short code/identifier for the academic year (e.g., AY2025, 2025-26)';
