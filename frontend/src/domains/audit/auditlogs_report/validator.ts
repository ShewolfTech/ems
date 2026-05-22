import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AuditlogsReport
 */
export const AuditlogsReportSchema = z.object({
  action: z.string().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  created_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  new_value: z.any().nullable(),
  old_value: z.any().nullable(),
  resource_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  resource_type: z.string().nullable(),
  school_scope: z.string().nullable(),
  user_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
}).passthrough();

export type AuditlogsReportType = z.infer<typeof AuditlogsReportSchema>;
