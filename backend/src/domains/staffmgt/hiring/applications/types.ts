export type ApplicationStatus = "submitted" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";

export type ApplicationsType = {
  id?: number;
  school_id?: number;
  job_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status?: ApplicationStatus;
  applied_at?: Date;
  notes?: string;
  interviewer_id?: number;
  interview_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateApplicationsInput = Partial<ApplicationsType>;
export type UpdateApplicationsInput = Partial<ApplicationsType>;