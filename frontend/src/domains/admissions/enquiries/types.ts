// Enquiries Domain Types

export type EnquiryStatus = 'new' | 'in_progress' | 'waiting_response' | 'converted' | 'closed' | 'rejected';
export type EnquiryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EnquirerType = 'student' | 'parent' | 'guardian' | 'external';
export type NoteType = 'general' | 'follow_up' | 'internal' | 'system';

export interface Enquiry {
  id?: number;
  school_id?: number;
  enquiry_type_id?: number;
  enquiry_source_id?: number;
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  subject: string;
  description: string;
  enquirer_name: string;
  enquirer_email?: string;
  enquirer_phone?: string;
  enquirer_type?: EnquirerType;
  enquirer_address?: string;
  enquirer_city?: string;
  enquirer_state?: string;
  enquirer_postal_code?: string;
  interested_grade?: string;
  interested_stream?: string;
  academic_year?: string;
  assigned_to?: number;
  assigned_by?: number;
  assigned_at?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  resolved_date?: string;
  resolved_by?: number;
  resolution_notes?: string;
  rejection_reason?: string;
  student_id?: number;
  staff_id?: number;
  reference_no?: string;
  enquiry_date?: string;
  last_contact_date?: string;
  next_action?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  is_deleted?: boolean;
  
  // Joined fields
  enquiry_type_name?: string;
  enquiry_type_color?: string;
  enquiry_source_name?: string;
  assigned_to_name?: string;
  assigned_to_username?: string;
  assigned_by_name?: string;
  student_first_name?: string;
  student_last_name?: string;
  admission_no?: string;
}

export interface EnquiryType {
  id?: number;
  school_id?: number;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface EnquirySource {
  id?: number;
  school_id?: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface EnquiryNote {
  id?: number;
  school_id?: number;
  enquiry_id: number;
  note: string;
  note_type?: NoteType;
  is_private?: boolean;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  is_deleted?: boolean;
  
  // Joined fields
  created_by_name?: string;
  created_by_username?: string;
}

export interface EnquiryAttachment {
  id?: number;
  school_id?: number;
  enquiry_id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_at?: string;
  uploaded_by?: number;
  is_deleted?: boolean;
}

export interface EnquiryFilters {
  status?: string;
  priority?: string;
  enquiry_type_id?: number;
  enquiry_source_id?: number;
  assigned_to?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface EnquiryStatistics {
  total?: number;
  new_count?: number;
  in_progress_count?: number;
  waiting_response_count?: number;
  converted_count?: number;
  closed_count?: number;
  rejected_count?: number;
}

export interface EnquiryFormData {
  enquiry_type_id?: number;
  enquiry_source_id?: number;
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  subject: string;
  description: string;
  enquirer_name: string;
  enquirer_email?: string;
  enquirer_phone?: string;
  enquirer_type?: EnquirerType;
  enquirer_address?: string;
  enquirer_city?: string;
  enquirer_state?: string;
  enquirer_postal_code?: string;
  interested_grade?: string;
  interested_stream?: string;
  academic_year?: string;
  assigned_to?: number;
  follow_up_date?: string;
  next_action?: string;
}
