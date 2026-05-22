import { z } from "zod";

/**
 * Validator for Assessment Results
 */
export const AssessmentResultSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  assessment_id: z.number(),
  student_id: z.number(),
  score: z.coerce.number().min(0, "Score cannot be negative"),
  grade_letter: z.string().optional().nullable(),
  grade_point: z.coerce.number().optional().nullable(),
  remarks: z.string().optional().nullable(),
  graded_by: z.number().optional().nullable(),
  is_final: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
}).passthrough();

/**
 * Validator for bulk grade entry
 */
export const BulkGradeEntrySchema = z.object({
  assessment_id: z.number(),
  grades: z.array(z.object({
    student_id: z.number(),
    score: z.coerce.number().min(0, "Score cannot be negative"),
    remarks: z.string().optional().nullable(),
  })),
});

export type AssessmentResultType = z.infer<typeof AssessmentResultSchema>;
export type BulkGradeEntryType = z.infer<typeof BulkGradeEntrySchema>;
