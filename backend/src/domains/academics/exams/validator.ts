import { z } from "zod";

/**
 * Validator for Exams - matches DB schema with conductors
 */
export const ExamsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  class_id: z.number(),
  subject_id: z.number(),
  term_id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  exam_date: z.string().or(z.date()),
  start_time: z.string().transform(s => s === '' ? null : s).optional().nullable(),
  end_time: z.string().transform(s => s === '' ? null : s).optional().nullable(),
  max_score: z.coerce.number().positive("Max score must be > 0"),
  weight: z.coerce.number().min(0.1, "Weight must be at least 0.1").max(1.0, "Weight cannot exceed 1.0").default(1.0).optional(),
  status_id: z.number().optional().nullable(),
  teacher_comments: z.any().optional().nullable(),
  // Multiple staff conducting this exam
  conductors: z.array(z.object({
    staff_id: z.number(),
    role: z.string().optional().default('invigilator'),
  })).optional().nullable(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_by: z.number().optional().nullable(),
  updated_by: z.number().optional().nullable(),
}).passthrough();

/**
 * Validator for bulk exam results entry
 */
export const BulkExamResultsSchema = z.object({
  exam_id: z.number(),
  max_score: z.coerce.number().positive("Max score is required"),
  results: z.array(z.object({
    student_id: z.number(),
    score: z.coerce.number().min(0, "Score cannot be negative"),
    grade_letter: z.string().optional().nullable(),
    grade_point: z.coerce.number().optional().nullable(),
    remarks: z.string().optional().nullable(),
  })),
}).superRefine((data, ctx) => {
  data.results.forEach((result, idx) => {
    if (result.score > data.max_score) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Score for student ${result.student_id} (${result.score}) exceeds max_score (${data.max_score})`,
        path: ["results", idx, "score"],
      });
    }
  });
});

export type ExamsType = z.infer<typeof ExamsSchema>;
export type BulkExamResultsType = z.infer<typeof BulkExamResultsSchema>;
