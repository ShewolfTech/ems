import { z } from "zod";

/**
 * Auto-generated Validator for Leaves
 */
export const LeavesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  user_id: z.number(),
  leave_type_id: z.number(),
  start_date: z.date(),
  end_date: z.date(),
  reason: z.string().min(1),
  document_url: z.string().optional(),
  status: z.enum(['pending','approved','rejected','cancelled','completed']).default('pending'),
  applied_at: z.date().optional(),
  approved_by: z.number().optional(),
  approved_at: z.date().optional(),
  reject_reason: z.string().optional(),
  is_emergency: z.boolean().default(false),
  created_at: z.date().optional(),
  created_by: z.number().optional(),
  updated_at: z.date().optional(),
  updated_by: z.number().optional(),
  is_deleted: z.boolean().default(false),
  deleted_at: z.date().optional(),
  deleted_by: z.number().optional(),
});

export type LeavesType = z.infer<typeof LeavesSchema>;

/**
 * Input for creating a new leave request
 */
export const CreateLeaveSchema = LeavesSchema.omit({ id: true, created_at: true, updated_at: true }).extend({
  start_date: z.string() || z.date(),
  end_date: z.string() || z.date(),
  applied_at: z.string().optional().or(z.date().optional()),
  approved_at: z.string().optional().or(z.date().optional()),
});

export type CreateLeaveInput = z.infer<typeof CreateLeaveSchema>;

/**
 * Input for updating an existing leave request
 */
export const UpdateLeaveSchema = LeavesSchema.omit({ id: true, school_id: true, user_id: true, created_at: true }).partial().extend({
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  applied_at: z.string().optional().or(z.date().optional()),
  approved_at: z.string().optional().or(z.date().optional()),
});

export type UpdateLeaveInput = z.infer<typeof UpdateLeaveSchema>;
