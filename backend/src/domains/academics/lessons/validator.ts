import { z } from "zod";

/**
 * Validator for Lessons
 */
export const LessonsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  title: z.string().min(1),
  class_id: z.number().optional(),
  subject_id: z.number().optional(),
  teacher_id: z.number().optional().nullable(),
  term_id: z.number().optional(),
  description: z.string().optional().nullable(),
  scheduled_date: z.string().or(z.date()).optional(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type LessonsType = z.infer<typeof LessonsSchema>;
