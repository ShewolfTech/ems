// Auto-generated types for Enquiries

/**
 * Represents the full Enquiries record
 */
export type EnquiriesType = {
  id?: number;
  school_id?: number;
  enquiry_type_id?: number;
  enquiry_source_id?: number;
  enquiry_status_id?: number;
  enquiry_priority_id?: number;
  enquiry_subject_id?: number;
  status?: 'new' | 'in_progress' | 'waiting_response' | 'converted' | 'closed' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  description?: string;
  enquirer_name?: string;
  enquirer_email?: string;
  enquirer_phone?: string;
  enquirer_type?: 'student' | 'parent' | 'guardian' | 'external';
  enquirer_address?: string;
  enquirer_city?: string;
  enquirer_state?: string;
  enquirer_postal_code?: string;
  interested_grade?: string;
  interested_stream?: string;
  academic_year?: string;
  assigned_to?: number;
  assigned_by?: number;
  assigned_at?: Date;
  follow_up_date?: Date;
  follow_up_notes?: string;
  resolved_date?: Date;
  resolved_by?: number;
  resolution_notes?: string;
  rejection_reason?: string;
  student_id?: number;
  staff_id?: number;
  reference_no?: string;
  enquiry_date?: Date;
  last_contact_date?: Date;
  next_action?: string;
  is_active?: boolean;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  is_deleted?: boolean;
  deleted_at?: Date;
  deleted_by?: number;
};

/**
 * Represents the data required to create a new Enquiries
 */
export type CreateEnquiriesInput = Partial<EnquiriesType>;

/**
 * Represents the data required to update an existing Enquiries
 */
export type UpdateEnquiriesInput = Partial<EnquiriesType>;

/**
 * Represents the full EnquiryStatusTypes record
 */
export type EnquiryStatusTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  display_order?: number;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the full EnquiryPriorityLevels record
 */
export type EnquiryPriorityLevelsType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  display_order?: number;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the full EnquirySubjects record
 */
export type EnquirySubjectsType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  parent_id?: number;
  display_order?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the full EnquiryTypes record
 */
export type EnquiryTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the full EnquirySources record
 */
export type EnquirySourcesType = {
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

/**
 * Represents the full EnquiryNotes record
 */
export type EnquiryNotesType = {
  id?: number;
  school_id?: number;
  enquiry_id?: number;
  note?: string;
  note_type?: 'general' | 'follow_up' | 'internal' | 'system';
  is_private?: boolean;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  is_deleted?: boolean;
};

/**
 * Represents the full EnquiryAttachments record
 */
export type EnquiryAttachmentsType = {
  id?: number;
  school_id?: number;
  enquiry_id?: number;
  file_name?: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  uploaded_at?: Date;
  uploaded_by?: number;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new EnquiryTypes
 */
export type CreateEnquiryTypesInput = Partial<EnquiryTypesType>;

/**
 * Represents the data required to update an existing EnquiryTypes
 */
export type UpdateEnquiryTypesInput = Partial<EnquiryTypesType>;

/**
 * Represents the data required to create a new EnquirySources
 */
export type CreateEnquirySourcesInput = Partial<EnquirySourcesType>;

/**
 * Represents the data required to update an existing EnquirySources
 */
export type UpdateEnquirySourcesInput = Partial<EnquirySourcesType>;

/**
 * Represents the data required to create a new EnquiryNotes
 */
export type CreateEnquiryNotesInput = Partial<EnquiryNotesType>;

/**
 * Represents the data required to update an existing EnquiryNotes
 */
export type UpdateEnquiryNotesInput = Partial<EnquiryNotesType>;

/**
 * Represents the data required to create a new EnquiryAttachments
 */
export type CreateEnquiryAttachmentsInput = Partial<EnquiryAttachmentsType>;

/**
 * Represents the data required to update an existing EnquiryAttachments
 */
export type UpdateEnquiryAttachmentsInput = Partial<EnquiryAttachmentsType>;
