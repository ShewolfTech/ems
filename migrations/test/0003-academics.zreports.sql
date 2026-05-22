-- 📄 Universal Report Template (SQL + JSONB Export)


-- 1. Report Metadata Table

CREATE TABLE IF NOT EXISTS report_metadata (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    context_info JSONB,          -- {"class":"S1","year":"2026","teacher":"Mr. Okello"}
    generated_on TIMESTAMPTZ DEFAULT NOW(),
    prepared_by BIGINT REFERENCES users(id),
    page_count INT,
    motto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. Universal Export Function

CREATE OR REPLACE FUNCTION generate_school_report(
    _report_title TEXT,
    _context_info JSONB,
    _body_query TEXT
) RETURNS JSONB AS $$
DECLARE result JSONB;
BEGIN
    result := jsonb_build_object(
        'header', jsonb_build_object(
            'school_logo','/assets/logo.png',
            'school_name',(SELECT name FROM schools WHERE id=current_school_id()),
            'report_title',_report_title,
            'context_info',_context_info,
            'date_generated',NOW()
        ),
        'body', (EXECUTE format('SELECT jsonb_agg(t) FROM (%s) t', _body_query)),
        'footer', jsonb_build_object(
            'prepared_by',current_user_id(),
            'generated_on',NOW(),
            'page_numbers','Page 1 of 1',
            'motto',(SELECT motto FROM schools WHERE id=current_school_id())
        )
    );
    RETURN result;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Example Usage


-- Students List Report

SELECT generate_school_report(
    'Class Student List',
    '{"class":"S1","year":"2026"}',
    'SELECT admission_no,name,gender,dob,guardian_contact FROM students WHERE school_id=current_school_id()'
);


-- Exam Results Report

SELECT generate_school_report(
    'Exam Results Summary',
    '{"class":"S1","term":"Term 1"}',
    'SELECT student_name,subject,score,grade,teacher_comment FROM exam_results WHERE school_id=current_school_id()'
);


CREATE OR REPLACE FUNCTION exams_performance_report(
    _class_id BIGINT DEFAULT NULL,
    _subject_id BIGINT DEFAULT NULL,
    _term_id BIGINT DEFAULT NULL,
    _min_score INT DEFAULT NULL
) RETURNS TABLE (
    exam_result_id BIGINT,
    student_id BIGINT,
    student_name TEXT,
    exam_id BIGINT,
    exam_title TEXT,
    subject_name TEXT,
    class_name TEXT,
    term_id BIGINT,
    term_name TEXT,
    academic_year TEXT,
    exam_date DATE,
    max_score INT,
    score INT,
    grade_letter TEXT,
    grade_point NUMERIC,
    remarks TEXT,
    exam_status TEXT,
    teacher_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM academics_exams_performance_view
    WHERE (_class_id IS NULL OR academics_exams_performance_view.class_name = 
           (SELECT name FROM classes WHERE id=_class_id))
      AND (_subject_id IS NULL OR academics_exams_performance_view.subject_name = 
           (SELECT name FROM subjects WHERE id=_subject_id))
      AND (_term_id IS NULL OR academics_exams_performance_view.term_id = _term_id)
      AND (_min_score IS NULL OR academics_exams_performance_view.score >= _min_score);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
