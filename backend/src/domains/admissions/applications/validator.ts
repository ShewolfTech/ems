import { z } from "zod";

/**
 * Admission Statuses Schema
 */
export const AdmissionStatusesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  display_order: z.number().optional(),
  is_final: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Application Types Schema
 */
export const ApplicationTypesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Applicants Schema
 */
export const ApplicantsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.date().or(z.string()),
  gender: z.string().optional(),
  nationality: z.string().default('Ugandan'),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  guardian_email: z.string().email().optional().or(z.literal("")),
  guardian_relationship: z.string().optional(),
  previous_school: z.string().optional(),
  previous_grade: z.string().optional(),
  leaving_certificate_no: z.string().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  created_by: z.number().optional(),
  updated_at: z.date().optional(),
  updated_by: z.number().optional(),
}).passthrough();

/**
 * Applications Schema
 */
export const ApplicationsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  applicant_id: z.number(),
  application_type_id: z.number().optional().nullable(),
  admission_status_id: z.number().optional().nullable(),
  applying_for_grade: z.string().min(1, "Grade is required"),
  applying_for_stream: z.string().optional(),
  academic_year: z.string().min(1, "Academic year is required"),
  intended_start_date: z.date().or(z.string()).optional().nullable(),
  enquiry_id: z.number().optional().nullable(),
  application_no: z.string().optional(),
  submission_date: z.date().optional(),
  review_date: z.date().optional().nullable(),
  reviewed_by: z.number().optional().nullable(),
  decision_date: z.date().optional().nullable(),
  decision_notes: z.string().optional(),
  enrollment_date: z.date().optional().nullable(),
  student_id: z.number().optional().nullable(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  created_by: z.number().optional(),
  updated_at: z.date().optional(),
  updated_by: z.number().optional(),
}).passthrough();

/**
 * Application Documents Schema
 */
export const ApplicationDocumentsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  application_id: z.number(),
  document_type: z.string().min(1, "Document type is required"),
  document_name: z.string().min(1, "Document name is required"),
  file_path: z.string().min(1, "File path is required"),
  file_name: z.string().min(1, "File name is required"),
  file_type: z.string().optional(),
  file_size: z.number().optional(),
  upload_date: z.date().optional(),
  uploaded_by: z.number().optional(),
  is_verified: z.boolean().default(false),
  verified_by: z.number().optional().nullable(),
  verified_at: z.date().optional().nullable(),
  verification_notes: z.string().optional(),
  is_deleted: z.boolean().default(false),
}).passthrough();

/**
 * Interviews Schema
 */
export const InterviewsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  application_id: z.number(),
  interview_type: z.string().default('general'),
  scheduled_date: z.date().or(z.string()),
  scheduled_end_time: z.date().or(z.string()).optional().nullable(),
  location: z.string().optional(),
  interviewer_ids: z.array(z.number()).optional(),
  interview_notes: z.string().optional(),
  interview_score: z.number().optional().nullable(),
  interview_outcome: z.string().optional(),
  outcome_notes: z.string().optional(),
  is_completed: z.boolean().default(false),
  completed_at: z.date().optional().nullable(),
  is_deleted: z.boolean().default(false),
}).passthrough();

export type AdmissionStatusesType = z.infer<typeof AdmissionStatusesSchema>;
export type ApplicationTypesType = z.infer<typeof ApplicationTypesSchema>;
export type ApplicantsType = z.infer<typeof ApplicantsSchema>;
export type ApplicationsType = z.infer<typeof ApplicationsSchema>;
export type ApplicationDocumentsType = z.infer<typeof ApplicationDocumentsSchema>;
export type InterviewsType = z.infer<typeof InterviewsSchema>;
