import { z } from "zod";

/**
 * Validator for Assignments
 */
export const AssignmentsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  class_id: z.number().optional(),
  subject_id: z.number().optional(),
  term_id: z.number().optional(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional().nullable(),
  start_date: z.union([z.string(), z.date()]).optional(),
  due_date: z.union([z.string(), z.date()]),
  max_score: z.union([z.number(), z.string()]).transform(val => {
    if (typeof val === 'string') return parseFloat(val);
    return val;
  }),
  weight: z.union([z.number(), z.string()]).optional().transform(val => {
    if (typeof val === 'string') return parseFloat(val) || 0;
    return val || 0;
  }),
  status_id: z.number().optional().nullable(),
  teacher_id: z.number().optional().nullable(),
  teacher_comments: z.any().optional().nullable(), // jsonb
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type AssignmentsType = z.infer<typeof AssignmentsSchema>;

/**
 * Validator for Bulk Assignment Submissions
 */
export const BulkAssignmentSubmissionsSchema = z.object({
  assignment_id: z.number(),
  max_score: z.number(),
  submissions: z.array(z.object({
    student_id: z.number(),
    score: z.number(),
    grade_letter: z.string().optional().nullable(),
    grade_point: z.number().optional().nullable(),
    remarks: z.string().optional().nullable(),
    submission_date: z.union([z.string(), z.date()]).optional(),
  })),
});
