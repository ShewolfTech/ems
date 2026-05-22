-- ============================================
-- LESSON DELIVERIES - Track actual lesson delivery events
-- ============================================
-- This table tracks each instance when a lesson was actually delivered,
-- allowing teachers to mark lessons as delivered/cancelled/postponed
-- with rich metadata about what happened during the lesson.
-- ============================================

CREATE TABLE IF NOT EXISTS lesson_deliveries (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
    timetable_entry_id BIGINT REFERENCES timetable_entries(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    delivered_at TIMESTAMPTZ,
    actual_start_time TIME,
    actual_end_time TIME CHECK (actual_end_time IS NULL OR actual_start_time IS NULL OR actual_end_time > actual_start_time),
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'delivered', 'cancelled', 'postponed')),
    teacher_notes TEXT,
    objectives_covered BOOLEAN DEFAULT NULL,
    challenges_faced TEXT,
    follow_up_needed BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    resources_used JSONB DEFAULT '[]'::JSONB,
    homework_assigned JSONB DEFAULT '[]'::JSONB,
    attendance_count INT DEFAULT 0,
    total_students INT DEFAULT 0,
    rescheduled_to_date DATE,
    rescheduled_from_id BIGINT REFERENCES lesson_deliveries(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

ALTER TABLE lesson_deliveries ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lesson_deliveries' AND policyname='lesson_deliveries_isolation') THEN
        EXECUTE 'DROP POLICY lesson_deliveries_isolation ON lesson_deliveries';
    END IF;
END$$;

CREATE POLICY lesson_deliveries_isolation ON lesson_deliveries
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);

CREATE INDEX IF NOT EXISTS idx_lesson_deliveries_school_lesson ON lesson_deliveries(school_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_deliveries_school_date ON lesson_deliveries(school_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_lesson_deliveries_school_status ON lesson_deliveries(school_id, status);

CREATE TRIGGER set_lesson_deliveries_updated_at
    BEFORE UPDATE ON lesson_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_plan JSONB DEFAULT '{}'::JSONB;

GRANT ALL ON TABLE lesson_deliveries TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE lesson_deliveries_id_seq TO authenticated;

-- Auto-generate lesson deliveries from timetables for the current term
CREATE OR REPLACE FUNCTION generate_lesson_deliveries_from_timetables(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_class_id BIGINT DEFAULT NULL,
    p_teacher_id BIGINT DEFAULT NULL,
    p_school_id BIGINT DEFAULT NULL
) RETURNS INT AS $$
DECLARE
    v_school_id BIGINT;
    v_date DATE;
    v_day_name TEXT;
    v_count INT := 0;
    v_inserted INT;
    v_actual_start DATE;
    v_actual_end DATE;
BEGIN
    -- Determine school context
    v_school_id := COALESCE(p_school_id,
        CASE
            WHEN p_class_id IS NOT NULL THEN (SELECT school_id FROM classes WHERE id = p_class_id)
            WHEN p_teacher_id IS NOT NULL THEN (SELECT school_id FROM staff WHERE id = p_teacher_id)
            ELSE current_setting('app.current_school_id', true)::BIGINT
        END
    );

    -- If no dates provided, use today to end of current active term
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        SELECT t.start_date, t.end_date INTO v_actual_start, v_actual_end
        FROM terms t
        WHERE t.school_id = v_school_id
          AND t.is_active = TRUE
          AND t.is_deleted = FALSE
          AND t.end_date >= CURRENT_DATE
        ORDER BY t.start_date ASC
        LIMIT 1;

        -- Fallback: if no active term, use the latest term
        IF v_actual_start IS NULL THEN
            SELECT t.start_date, t.end_date INTO v_actual_start, v_actual_end
            FROM terms t
            WHERE t.school_id = v_school_id
              AND t.is_deleted = FALSE
            ORDER BY t.end_date DESC
            LIMIT 1;
        END IF;

        -- Always start from TODAY (not term start) to avoid past lessons
        v_actual_start := COALESCE(v_actual_start, CURRENT_DATE);
        IF v_actual_start < CURRENT_DATE THEN
            v_actual_start := CURRENT_DATE;
        END IF;
        v_actual_end := COALESCE(v_actual_end, CURRENT_DATE + INTERVAL '12 weeks');
    ELSE
        v_actual_start := p_start_date;
        v_actual_end := p_end_date;
    END IF;

    -- Loop through each date in range
    v_date := v_actual_start;
    WHILE v_date <= v_actual_end LOOP
        -- Convert date to day name matching timetable_entries.day_of_week
        -- Use EXTRACT(ISODOW FROM date): 1=Monday, 2=Tuesday, ..., 7=Sunday
        v_day_name := CASE EXTRACT(ISODOW FROM v_date)::INT
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            WHEN 7 THEN 'Sunday'
        END;

        -- Insert delivery records directly from timetable entries (no lessons required)
        INSERT INTO lesson_deliveries (
            school_id,
            lesson_id,
            timetable_entry_id,
            scheduled_date,
            status,
            actual_start_time,
            actual_end_time,
            created_by
        )
        SELECT 
            v_school_id,
            NULL,
            te.id,
            v_date,
            'planned',
            te.start_time,
            te.end_time,
            current_setting('app.current_user_id', true)::BIGINT
        FROM timetable_entries te
        JOIN timetables t ON te.timetable_id = t.id
        WHERE te.school_id = v_school_id
            AND te.is_active = TRUE
            AND t.is_active = TRUE
            AND te.subject_id IS NOT NULL  -- Skip entries without subject (breaks)
            AND (te.room IS NULL OR te.room NOT LIKE 'BREAK:%')  -- Skip break entries
            AND te.day_of_week = v_day_name
            AND (p_class_id IS NULL OR t.class_id = p_class_id)
            AND (p_teacher_id IS NULL OR te.teacher_id = p_teacher_id)
            AND NOT EXISTS (
                SELECT 1 FROM lesson_deliveries ld
                WHERE ld.timetable_entry_id = te.id
                    AND ld.scheduled_date = v_date
                    AND ld.is_deleted = FALSE
            );

        GET DIAGNOSTICS v_inserted = ROW_COUNT;
        v_count := v_count + v_inserted;

        v_date := v_date + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW v_todays_lesson_deliveries AS
SELECT
    ld.id as delivery_id,
    ld.lesson_id,
    ld.timetable_entry_id,
    ld.scheduled_date,
    COALESCE(c.name, c2.name, 'N/A') as class_name,
    COALESCE(c.code, c2.code, 'N/A') as class_code,
    COALESCE(sub.name, sub2.name, 'N/A') as subject_name,
    COALESCE(sub.code, sub2.code, 'N/A') as subject_code,
    COALESCE(concat(u.first_name, ' ', u.last_name), concat(u2.first_name, ' ', u2.last_name), 'Unassigned') as teacher_name,
    COALESCE(l.start_time, te.start_time) as start_time,
    COALESCE(l.end_time, te.end_time) as end_time,
    ld.status,
    ld.objectives_covered,
    ld.attendance_count,
    ld.total_students,
    ld.teacher_notes,
    ld.challenges_faced,
    ld.follow_up_needed,
    ld.follow_up_notes,
    ld.resources_used,
    ld.homework_assigned
FROM lesson_deliveries ld
LEFT JOIN timetable_entries te ON te.id = ld.timetable_entry_id
LEFT JOIN timetables t2 ON t2.id = te.timetable_id
LEFT JOIN classes c2 ON c2.id = t2.class_id
LEFT JOIN subjects sub2 ON sub2.id = te.subject_id
LEFT JOIN staff st2 ON st2.id = te.teacher_id
LEFT JOIN users u2 ON u2.id = st2.user_id
LEFT JOIN lessons l ON l.id = ld.lesson_id
LEFT JOIN classes c ON c.id = l.class_id
LEFT JOIN subjects sub ON sub.id = l.subject_id
LEFT JOIN staff st ON st.id = l.teacher_id
LEFT JOIN users u ON u.id = st.user_id
WHERE ld.scheduled_date = CURRENT_DATE AND ld.is_deleted = FALSE;

CREATE OR REPLACE VIEW v_lesson_deliveries_detail AS
SELECT
    ld.id as delivery_id,
    ld.lesson_id,
    ld.timetable_entry_id,
    ld.scheduled_date,
    ld.delivered_at,
    ld.actual_start_time,
    ld.actual_end_time,
    COALESCE(c2.name, c.name, 'N/A') as class_name,
    COALESCE(c2.code, c.code, 'N/A') as class_code,
    COALESCE(sub2.name, sub.name, 'N/A') as subject_name,
    COALESCE(sub2.code, sub.code, 'N/A') as subject_code,
    COALESCE(concat(u2.first_name, ' ', u2.last_name), concat(u.first_name, ' ', u.last_name), 'Unassigned') as teacher_name,
    te.start_time as lesson_start_time,
    te.end_time as lesson_end_time,
    l.start_time as lesson_template_start,
    l.end_time as lesson_template_end,
    ld.status,
    ld.objectives_covered,
    ld.attendance_count,
    ld.total_students,
    ld.teacher_notes,
    ld.challenges_faced,
    ld.follow_up_needed,
    ld.follow_up_notes,
    ld.resources_used,
    ld.homework_assigned,
    ld.rescheduled_to_date,
    ld.rescheduled_from_id,
    ld.created_at,
    ld.updated_at,
    -- Linked info
    orig.scheduled_date as original_scheduled_date,
    orig.status as original_status,
    new_del.scheduled_date as rescheduled_scheduled_date,
    new_del.status as rescheduled_status
FROM lesson_deliveries ld
LEFT JOIN timetable_entries te ON te.id = ld.timetable_entry_id
LEFT JOIN timetables t2 ON t2.id = te.timetable_id
LEFT JOIN classes c2 ON c2.id = t2.class_id
LEFT JOIN subjects sub2 ON sub2.id = te.subject_id
LEFT JOIN staff st2 ON st2.id = te.teacher_id
LEFT JOIN users u2 ON u2.id = st2.user_id
LEFT JOIN lessons l ON l.id = ld.lesson_id
LEFT JOIN classes c ON c.id = l.class_id
LEFT JOIN subjects sub ON sub.id = l.subject_id
LEFT JOIN staff st ON st.id = l.teacher_id
LEFT JOIN users u ON u.id = st.user_id
LEFT JOIN lesson_deliveries orig ON orig.id = ld.rescheduled_from_id
LEFT JOIN lesson_deliveries new_del ON new_del.rescheduled_from_id = ld.id
WHERE ld.is_deleted = FALSE;
