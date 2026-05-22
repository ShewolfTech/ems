import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AcademicsClassscheduleView
 */
export const AcademicsClassscheduleViewSchema = z.object({
  class_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  class_name: z.string().nullable(),
  end_time: z.string().nullable(),
  id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  lesson_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  lesson_status: z.string().nullable(),
  lesson_title: z.string().nullable(),
  scheduled_date: z.coerce.date().optional().nullable(),
  school_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  start_time: z.string().nullable(),
  subject_name: z.string().nullable(),
  teacher_comment: z.string().nullable(),
  teacher_name: z.string().nullable(),
  term_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  term_name: z.string().nullable(),
  timetable_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  timetable_name: z.string().nullable(),
}).passthrough();

export type AcademicsClassscheduleViewType = z.infer<typeof AcademicsClassscheduleViewSchema>;
