-- ============================================
-- Migration 0020: Exams Enhancement - Add Weight & Fix Teacher ID
-- ============================================
-- Purpose:
-- 1. Add weight column to exams (0.1 to 1.0) for grade aggregation
-- 2. Make teacher_id nullable since we use exam_conductors junction table
-- 3. Add index on weight for performance
-- ============================================

-- Step 1: Make teacher_id nullable (we use exam_conductors instead)
ALTER TABLE exams ALTER COLUMN teacher_id DROP NOT NULL;

-- Step 2: Add weight column with default 1.0 and check constraint
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2) DEFAULT 1.0 
CHECK (weight >= 0.1 AND weight <= 1.0);

-- Step 3: Add comment explaining the weight column
COMMENT ON COLUMN exams.weight IS 'Weight for grade aggregation (0.1 to 1.0). Used to calculate final grades when combining multiple exam/assessment types.';

-- Step 4: Create index for weight-based queries
CREATE INDEX IF NOT EXISTS idx_exams_weight 
ON exams(weight) 
WHERE is_deleted = FALSE;

-- Step 5: Update existing exams to have weight = 1.0 if null
UPDATE exams 
SET weight = 1.0 
WHERE weight IS NULL AND is_deleted = FALSE;

-- ============================================
-- Verification Queries
-- ============================================
-- Check column exists
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'exams' AND column_name = 'weight';

-- Check teacher_id is now nullable
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'exams' AND column_name = 'teacher_id';
