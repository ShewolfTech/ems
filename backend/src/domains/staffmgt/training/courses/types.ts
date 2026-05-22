export type CourseStatus = "draft" | "published" | "in-progress" | "completed" | "cancelled";
export type CourseCategory = "professional-development" | "skills" | "compliance" | "leadership" | "technical" | "other";

export type CoursesType = {
  id?: number;
  school_id?: number;
  title?: string;
  description?: string;
  category?: CourseCategory;
  provider?: string;
  start_date?: Date;
  end_date?: Date;
  duration_hours?: number;
  location?: string;
  is_online?: boolean;
  certificate_url?: string;
  cost?: number;
  currency?: string;
  max_participants?: number;
  status?: CourseStatus;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateCoursesInput = Partial<CoursesType>;
export type UpdateCoursesInput = Partial<CoursesType>;