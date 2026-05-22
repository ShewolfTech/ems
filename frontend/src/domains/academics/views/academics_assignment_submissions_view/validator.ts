import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AcademicsAssignmentSubmissionsView
 */
export const AcademicsAssignmentSubmissionsViewSchema = z.object({
  assignment_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  assignment_title: z.string().nullable(),
  class_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  class_name: z.string().nullable(),
  due_date: z.coerce.date().optional().nullable(),
  graded_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  graded_on: z.coerce.date().nullable(),
  grade_letter: z.string().nullable(),
  grade_point: z.coerce.number().nullable(),
  id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
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
  subject_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  subject_name: z.string().nullable(),
  submission_date: z.coerce.date().optional().nullable(),
  submission_status: z.string().nullable(),
  teacher_comment: z.string().nullable(),
  term_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  term_name: z.string().nullable(),
}).passthrough();

export type AcademicsAssignmentSubmissionsViewType = z.infer<typeof AcademicsAssignmentSubmissionsViewSchema>;
