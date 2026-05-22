import { z } from "zod";

/**
 * Auto-generated Validator for LeaveTypes
 */
export const LeaveTypesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
  max_days_per_year: z.number().optional(),
  requires_document: z.boolean().default(true),
  requires_approval: z.boolean().default(true),
  is_paid: z.boolean().default(false),
  is_for_students: z.boolean().default(true),
  is_for_staff: z.boolean().default(true),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  created_by: z.number().optional(),
  updated_at: z.date().optional(),
  updated_by: z.number().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.date().optional(),
  deleted_by: z.number().optional(),
}).passthrough();

export type LeaveTypesType = z.infer<typeof LeaveTypesSchema>;
