-- Add weight column to assignments table
-- This column determines how much the assignment contributes to the final grade

-- Add weight column with default value of 0 (doesn't count toward final grade)
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS weight NUMERIC(5, 2) DEFAULT 0;

-- Add constraint to ensure weight is in valid range (0 to 10.0)
-- 0 = practice only, doesn't count toward final grade
ALTER TABLE assignments ADD CONSTRAINT chk_assignments_weight_range 
CHECK (weight >= 0 AND weight <= 10.0);

-- Add index for weight column (useful for filtering by weight)
CREATE INDEX IF NOT EXISTS idx_assignments_weight ON assignments(weight);

-- Add comment to document the column
COMMENT ON COLUMN assignments.weight IS 'Weight factor for grade aggregation. Range: 0 to 10.0. Default: 0. 0 = practice only (no grade impact), higher values = more impact on final grade.';
