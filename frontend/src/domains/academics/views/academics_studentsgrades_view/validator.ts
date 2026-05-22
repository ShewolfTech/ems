import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AcademicsStudentsgradesView
 */
export const AcademicsStudentsgradesViewSchema = z.object({
  academic_year: z.string().nullable(),
  assessment_date: z.coerce.date().optional().nullable(),
  assessment_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  assessment_status: z.string().nullable(),
  assessment_title: z.string().nullable(),
  assessment_type: z.string().nullable(),
  class_name: z.string().nullable(),
  grade_letter: z.string().nullable(),
  grade_level: z.string().nullable(),
  grade_point: z.coerce.number().nullable(),
  id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  max_score: z.coerce.number().nullable(),
  remarks: z.string().nullable(),
  school_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  score: z.coerce.number().nullable(),
  student_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  student_name: z.string().nullable(),
  subject_name: z.string().nullable(),
  teacher_comment: z.string().nullable(),
  teacher_name: z.string().nullable(),
  term_name: z.string().nullable(),
}).passthrough();

export type AcademicsStudentsgradesViewType = z.infer<typeof AcademicsStudentsgradesViewSchema>;
