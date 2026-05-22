import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AuditrouteReport
 */
export const AuditrouteReportSchema = z.object({
  action: z.string().nullable(),
  audit_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  created_at: z.coerce.date().optional().nullable(),
  diff: z.any().nullable(),
  method: z.string().nullable(),
  permission_resource: z.string().nullable(),
  resource_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  resource_type: z.string().nullable(),
  role_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  route: z.string().nullable(),
  school_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  user_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
}).passthrough();

export type AuditrouteReportType = z.infer<typeof AuditrouteReportSchema>;
