import { z } from "zod";

/**
 * Auto-generated Validator for Classes
 */
export const ClassesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  name: z.string().min(1),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type ClassesType = z.infer<typeof ClassesSchema>;
