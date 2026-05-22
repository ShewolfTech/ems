import { z } from "zod";

/**
 * Enquiry Status Types Schema
 */
export const EnquiryStatusTypesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  display_order: z.number().optional(),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Enquiry Priority Levels Schema
 */
export const EnquiryPriorityLevelsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  display_order: z.number().optional(),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Enquiry Subjects Schema
 */
export const EnquirySubjectsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.number().optional().nullable(),
  display_order: z.number().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Enquiry Types Schema
 */
export const EnquiryTypesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Enquiry Sources Schema
 */
export const EnquirySourcesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

/**
 * Enquiry Notes Schema
 */
export const EnquiryNotesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  enquiry_id: z.number(),
  note: z.string().min(1, "Note is required"),
  note_type: z.enum(["general", "follow_up", "internal", "system"]).default("general"),
  is_private: z.boolean().default(false),
  created_at: z.date().optional(),
  created_by: z.number().optional(),
  updated_at: z.date().optional(),
  updated_by: z.number().optional(),
  is_deleted: z.boolean().default(false),
}).passthrough();

/**
 * Enquiry Attachments Schema
 */
export const EnquiryAttachmentsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  enquiry_id: z.number(),
  file_name: z.string().min(1, "File name is required"),
  file_path: z.string().min(1, "File path is required"),
  file_type: z.string().optional(),
  file_size: z.number().optional(),
  uploaded_at: z.date().optional(),
  uploaded_by: z.number().optional(),
  is_deleted: z.boolean().default(false),
}).passthrough();

/**
 * Main Enquiry Schema
 */
export const EnquiriesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),

  // Classification - Using lookup table IDs
  enquiry_type_id: z.number().optional().nullable(),
  enquiry_source_id: z.number().optional().nullable(),
  enquiry_status_id: z.number().optional().nullable(),
  enquiry_priority_id: z.number().optional().nullable(),
  enquiry_subject_id: z.number().optional().nullable(),
  
  // Legacy fields (keep for backward compatibility)
  status: z.enum(["new", "in_progress", "waiting_response", "converted", "closed", "rejected"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

  // Subject & Description
  subject: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  
  // Enquirer Details
  enquirer_name: z.string().min(1, "Enquirer name is required").max(200),
  enquirer_email: z.string().email("Invalid email").optional().or(z.literal("")).optional(),
  enquirer_phone: z.string().optional(),
  enquirer_category_id: z.number().optional().nullable(),  // NEW: Links to enquirer_categories
  enquirer_address: z.string().optional(),
  enquirer_city: z.string().optional(),
  enquirer_state: z.string().optional(),
  enquirer_postal_code: z.string().optional(),
  
  // Academic Interest
  interested_grade: z.string().optional(),
  interested_stream: z.string().optional(),
  academic_year: z.string().optional(),
  
  // Assignment & Tracking
  assigned_to: z.number().optional().nullable(),
  assigned_by: z.number().optional().nullable(),
  assigned_at: z.date().optional(),

  // Follow-up & Resolution
  follow_up_date: z.union([z.date(), z.string()]).optional().nullable(),
  follow_up_notes: z.string().optional(),
  resolved_date: z.union([z.date(), z.string()]).optional(),
  resolved_by: z.number().optional().nullable(),
  resolution_notes: z.string().optional(),
  rejection_reason: z.string().optional(),

  // Relationships
  student_id: z.number().optional().nullable(),
  staff_id: z.number().optional().nullable(),

  // Reference & Tracking
  reference_no: z.string().optional(),
  enquiry_date: z.union([z.date(), z.string()]).optional(),
  last_contact_date: z.union([z.date(), z.string()]).optional(),
  next_action: z.string().optional(),

  // Metadata
  is_active: z.boolean().default(true),
  created_at: z.union([z.date(), z.string()]).optional(),
  created_by: z.number().optional().nullable(),
  updated_at: z.union([z.date(), z.string()]).optional(),
  updated_by: z.number().optional().nullable(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.union([z.date(), z.string()]).optional(),
  deleted_by: z.number().optional().nullable(),
}).passthrough();

export type EnquiriesType = z.infer<typeof EnquiriesSchema>;
export type EnquiryTypesType = z.infer<typeof EnquiryTypesSchema>;
export type EnquirySourcesType = z.infer<typeof EnquirySourcesSchema>;
export type EnquiryNotesType = z.infer<typeof EnquiryNotesSchema>;
export type EnquiryAttachmentsType = z.infer<typeof EnquiryAttachmentsSchema>;
