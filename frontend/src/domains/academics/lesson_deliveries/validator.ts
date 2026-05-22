import { z } from "zod";

export const LessonDeliverySchema = z.object({
  id: z.number().optional(),
  lesson_id: z.number(),
  scheduled_date: z.string(),
  delivered_at: z.string().nullable().optional(),
  actual_start_time: z.string().nullable().optional(),
  actual_end_time: z.string().nullable().optional(),
  status: z.enum(['planned', 'delivered', 'cancelled', 'postponed']).default('planned'),
  teacher_notes: z.string().nullable().optional(),
  objectives_covered: z.boolean().nullable().optional(),
  challenges_faced: z.string().nullable().optional(),
  follow_up_needed: z.boolean().default(false),
  follow_up_notes: z.string().nullable().optional(),
  resources_used: z.any().default([]),
  homework_assigned: z.any().default([]),
  attendance_count: z.number().default(0),
  total_students: z.number().default(0),
  is_active: z.boolean().default(true),
}).passthrough();

export const QuickMarkDeliverySchema = z.object({
  teacher_notes: z.string().optional(),
  objectives_covered: z.boolean().optional(),
  resources_used: z.any().optional(),
  homework_assigned: z.any().optional(),
  challenges_faced: z.string().optional(),
  follow_up_needed: z.boolean().optional(),
  follow_up_notes: z.string().optional(),
});

export type LessonDeliveryType = z.infer<typeof LessonDeliverySchema>;
