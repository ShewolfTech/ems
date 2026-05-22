-- Add start_date column to assignments table and update due_date type
-- This migration handles view dependencies safely

-- Step 1: Drop the dependent view first
DROP VIEW IF EXISTS academics_assignment_submissions_view;

-- Step 2: Add start_date column
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

-- Step 3: Update the due_date column type to TIMESTAMPTZ (if needed)
-- Only alter if the column is not already TIMESTAMPTZ
DO $$
BEGIN
    -- Check if due_date is not already TIMESTAMPTZ
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'assignments'
        AND column_name = 'due_date'
        AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE assignments ALTER COLUMN due_date TYPE TIMESTAMPTZ;
    END IF;
END $$;

-- Step 4: Recreate the view with updated structure
CREATE OR REPLACE VIEW academics_assignment_submissions_view AS
SELECT
    sub.id::INT AS "id",
    sub.assignment_id::INT AS "assignmentId",
    a.school_id::INT AS "schoolId",
    COALESCE(a.title, 'N/A') AS "assignmentTitle",
    a.due_date AS "dueDate",
    a.start_date AS "startDate",
    a.class_id::INT AS "classId",
    COALESCE(c.name, 'N/A') AS "className",
    a.subject_id::INT AS "subjectId",
    COALESCE(subj.name, 'N/A') AS "subjectName",
    a.term_id::INT AS "termId",
    COALESCE(t.name, 'N/A') AS "termName",
    sub.student_id::INT AS "studentId",
    COALESCE(stu.first_name || ' ' || stu.last_name, 'N/A') AS "studentName",
    sub.submission_date AS "submissionDate",
    COALESCE(s.label, 'N/A') AS "submissionStatus",
    COALESCE(sub.score, 0)::FLOAT AS "score",
    COALESCE(sub.grade_letter, '-') AS "gradeLetter",
    COALESCE(sub.grade_point, 0)::FLOAT AS "gradePoint",
    COALESCE(sub.remarks, '') AS "remarks",
    COALESCE(sub.teacher_comments->>'general','No comment') AS "teacherComment",
    COALESCE(u.first_name || ' ' || u.last_name, 'N/A') AS "gradedBy",
    sub.updated_at AS "gradedOn"
FROM assignment_submissions sub
JOIN assignments a ON sub.assignment_id = a.id
JOIN students stu ON sub.student_id = stu.id
JOIN classes c ON a.class_id = c.id
JOIN subjects subj ON a.subject_id = subj.id
LEFT JOIN terms t ON a.term_id = t.id
LEFT JOIN staff st ON sub.graded_by = st.id
LEFT JOIN users u ON st.user_id = u.id
LEFT JOIN statuses s ON sub.status_id = s.id
WHERE sub.is_deleted = FALSE AND a.is_deleted = FALSE AND sub.is_active = TRUE AND a.is_active = TRUE;

-- Step 5: Add index for start_date for better query performance
CREATE INDEX IF NOT EXISTS idx_assignments_start_date ON assignments(start_date);

-- Add composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_assignments_date_range ON assignments(start_date, due_date);
