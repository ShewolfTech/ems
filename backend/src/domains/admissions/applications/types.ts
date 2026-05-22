// Auto-generated types for Admissions

export type AdmissionStatusesType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  display_order?: number;
  is_final?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type ApplicationTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type ApplicantsType = {
  id?: number;
  school_id?: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  previous_school?: string;
  previous_grade?: string;
  leaving_certificate_no?: string;
  is_active?: boolean;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  is_deleted?: boolean;
};

export type ApplicationsType = {
  id?: number;
  school_id?: number;
  applicant_id?: number;
  application_type_id?: number;
  admission_status_id?: number;
  applying_for_grade?: string;
  applying_for_stream?: string;
  academic_year?: string;
  intended_start_date?: Date;
  enquiry_id?: number;
  application_no?: string;
  submission_date?: Date;
  review_date?: Date;
  reviewed_by?: number;
  decision_date?: Date;
  decision_notes?: string;
  enrollment_date?: Date;
  student_id?: number;
  is_active?: boolean;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  is_deleted?: boolean;
};

export type ApplicationDocumentsType = {
  id?: number;
  school_id?: number;
  application_id?: number;
  document_type?: string;
  document_name?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  upload_date?: Date;
  uploaded_by?: number;
  is_verified?: boolean;
  verified_by?: number;
  verified_at?: Date;
  verification_notes?: string;
  is_deleted?: boolean;
};

export type InterviewsType = {
  id?: number;
  school_id?: number;
  application_id?: number;
  interview_type?: string;
  scheduled_date?: Date;
  scheduled_end_time?: Date;
  location?: string;
  interviewer_ids?: number[];
  interview_notes?: string;
  interview_score?: number;
  interview_outcome?: string;
  outcome_notes?: string;
  is_completed?: boolean;
  completed_at?: Date;
  is_deleted?: boolean;
};

export type CreateApplicantsInput = Partial<ApplicantsType>;
export type UpdateApplicantsInput = Partial<ApplicantsType>;
export type CreateApplicationsInput = Partial<ApplicationsType>;
export type UpdateApplicationsInput = Partial<ApplicationsType>;
