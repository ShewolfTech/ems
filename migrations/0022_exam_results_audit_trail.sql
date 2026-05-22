-- ============================================
-- Migration 0022: Exam Results Audit Trail
-- ============================================
-- Purpose:
-- 1. Remove UNIQUE constraint on (school_id, exam_id, student_id)
-- 2. Add partial UNIQUE index that only applies to non-deleted records
-- 3. This allows multiple versions of results for audit purposes
-- ============================================

-- Step 1: Drop the existing unique constraint
ALTER TABLE exam_results DROP CONSTRAINT IF EXISTS exam_results_school_id_exam_id_student_id_key;

-- Step 2: Create a partial unique index (only on non-deleted records)
CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_results_unique_active 
ON exam_results(school_id, exam_id, student_id) 
WHERE is_deleted = FALSE;

-- Step 3: Add comment explaining the audit trail
COMMENT ON TABLE exam_results IS 'Exam results with full audit trail. Old records are soft-deleted, not overwritten.';

-- ============================================
-- Verification
-- ============================================
-- Check constraint is removed
-- SELECT conname FROM pg_constraint WHERE conrelid = 'exam_results'::regclass;

-- Check new index exists
-- SELECT indexname FROM pg_indexes WHERE tablename = 'exam_results' AND indexname = 'idx_exam_results_unique_active';
