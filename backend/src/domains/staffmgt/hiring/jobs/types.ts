export type JobStatus = "draft" | "open" | "closed" | "cancelled";
export type EmploymentType = "full-time" | "part-time" | "contract" | "intern";

export type JobsType = {
  id?: number;
  school_id?: number;
  title?: string;
  description?: string;
  department_id?: number;
  employment_type?: EmploymentType;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  location?: string;
  status?: JobStatus;
  posted_at?: Date;
  closing_date?: Date;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateJobsInput = Partial<JobsType>;
export type UpdateJobsInput = Partial<JobsType>;