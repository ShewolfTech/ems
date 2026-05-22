import { z } from "zod";

/**
 * Validator for Assessments - matches DB schema
 */
export const AssessmentsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  class_id: z.number(),
  subject_id: z.number(),
  term_id: z.number(),
  assessment_type_id: z.number().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  max_score: z.coerce.number().positive("Max score must be > 0"),
  weight: z.coerce.number().positive().default(1.0),
  date: z.string().or(z.date()),
  status_id: z.number().optional().nullable(),
  teacher_comments: z.any().optional().nullable(),
  // Multiple staff conducting this assessment
  conductors: z.array(z.object({
    staff_id: z.number(),
    role: z.string().optional().default('invigilator'),
  })).optional().nullable(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_by: z.number().optional().nullable(),
  updated_by: z.number().optional().nullable(),
}).passthrough();

export type AssessmentsType = z.infer<typeof AssessmentsSchema>;

/**
 * Validator for bulk grade entry
 */
export const BulkGradeEntrySchema = z.object({
  assessment_id: z.number(),
  grades: z.array(z.object({
    student_id: z.number(),
    score: z.coerce.number().min(0),
    remarks: z.string().optional().nullable(),
  })),
});

export type BulkGradeEntryType = z.infer<typeof BulkGradeEntrySchema>;
