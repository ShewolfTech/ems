import { z } from "zod";

/**
 * Auto-generated Validator for Timetables
 */
export const TimetablesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  class_id: z.number().optional(),
  term_id: z.number().optional(),
  name: z.string().min(1),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type TimetablesType = z.infer<typeof TimetablesSchema>;
