-- Create class_attendance table for tracking attendance per lesson
CREATE TABLE IF NOT EXISTS public.class_attendance (
  id bigserial NOT NULL,
  school_id bigint NOT NULL,
  lesson_id bigint NOT NULL,
  student_id bigint NOT NULL,
  status character varying(1) NOT NULL, -- P, A, L, E
  remark text,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by bigint,
  updated_at timestamp with time zone NULL DEFAULT now(),
  updated_by bigint,
  is_deleted boolean NULL DEFAULT false,
  deleted_at timestamp with time zone,
  deleted_by bigint,
  CONSTRAINT class_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT class_attendance_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools (id) ON DELETE CASCADE,
  CONSTRAINT class_attendance_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
  CONSTRAINT class_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  CONSTRAINT class_attendance_status_check CHECK ((status = ANY (ARRAY['P'::character varying, 'A'::character varying, 'L'::character varying, 'E'::character varying])))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_class_attendance_lesson ON public.class_attendance USING btree (school_id, lesson_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_class_attendance_student ON public.class_attendance USING btree (school_id, student_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_class_attendance_updated ON public.class_attendance USING btree (school_id, updated_at) TABLESPACE pg_default;
