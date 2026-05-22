export type EnrollmentStatus = "enrolled" | "in-progress" | "completed" | "dropped" | "failed";

export type EnrollmentsType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  course_id?: number;
  enrolled_at?: Date;
  completed_at?: Date;
  certificate_url?: string;
  grade?: string;
  feedback?: string;
  status?: EnrollmentStatus;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateEnrollmentsInput = Partial<EnrollmentsType>;
export type UpdateEnrollmentsInput = Partial<EnrollmentsType>;