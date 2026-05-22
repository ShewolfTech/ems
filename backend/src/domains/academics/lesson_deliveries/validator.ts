import { z } from "zod";

export const LessonDeliverySchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  lesson_id: z.number().optional().nullable(),
  class_id: z.number().optional().nullable(),
  subject_id: z.number().optional().nullable(),
  teacher_id: z.number().optional().nullable(),
  timetable_entry_id: z.number().optional().nullable(),
  scheduled_date: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  delivered_at: z.union([z.string(), z.date()]).optional().nullable(),
  actual_start_time: z.string().optional().nullable(),
  actual_end_time: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  status: z.enum(['planned', 'delivered', 'cancelled', 'postponed']).default('planned'),
  title: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  teacher_notes: z.string().optional().nullable(),
  objectives_covered: z.boolean().optional().nullable(),
  challenges_faced: z.string().optional().nullable(),
  follow_up_needed: z.boolean().default(false),
  follow_up_notes: z.string().optional().nullable(),
  resources_used: z.any().default([]),
  homework_assigned: z.any().default([]),
  attendance_count: z.number().default(0),
  total_students: z.number().default(0),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
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

export const GenerateDeliveriesSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  class_id: z.number().optional(),
  teacher_id: z.number().optional(),
});

export type LessonDeliveryType = z.infer<typeof LessonDeliverySchema>;
export type QuickMarkDeliveryType = z.infer<typeof QuickMarkDeliverySchema>;
export type GenerateDeliveriesType = z.infer<typeof GenerateDeliveriesSchema>;
