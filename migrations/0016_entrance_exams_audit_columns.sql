-- Add audit columns to entrance_exams table
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES users(id);

-- Add index for soft-deleted records
CREATE INDEX IF NOT EXISTS idx_entrance_exams_deleted ON entrance_exams(deleted_at) WHERE deleted_at IS NOT NULL;
