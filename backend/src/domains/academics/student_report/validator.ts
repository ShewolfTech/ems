import { z } from "zod";

export const StudentReportParamsSchema = z.object({
  student_id: z.number(),
  class_id: z.number().optional(),
  term_id: z.number().optional(),
  academic_year_id: z.number().optional(),
});

export type StudentReportParams = z.infer<typeof StudentReportParamsSchema>;