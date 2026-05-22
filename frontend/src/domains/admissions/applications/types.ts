// Admissions Domain Types

export type AdmissionStatus = {
  id?: number;
  name: string;
  code: string;
  color?: string;
  is_final?: boolean;
};

export type ApplicationType = {
  id?: number;
  name: string;
  code: string;
  description?: string;
};

export type Applicant = {
  id?: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  previous_school?: string;
};

export type Application = {
  id?: number;
  applicant_id?: number;
  application_type_id?: number;
  admission_status_id?: number;
  applying_for_grade: string;
  applying_for_stream?: string;
  academic_year: string;
  application_no?: string;
  submission_date?: string;
  status_name?: string;
  status_code?: string;
  status_color?: string;
  applicant_first_name?: string;
  applicant_last_name?: string;
  applicant_email?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  enquiry_id?: number;
  student_id?: number;
};

export interface ApplicationFormData {
  applicant_id?: number;
  application_type_id?: number;
  admission_status_id?: number;
  applying_for_grade: string;
  applying_for_stream?: string;
  academic_year: string;
  intended_start_date?: string;
  enquiry_id?: number;
}

export interface ApplicantFormData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
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
}
