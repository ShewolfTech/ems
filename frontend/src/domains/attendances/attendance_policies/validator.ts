import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AttendancePolicies
 */
export const AttendancePoliciesSchema = z.object({
  absent_after_late_threshold: z.coerce.number().nullable(),
  auto_excuse_rules: z.any().nullable(),
  consecutive_absence_alert: z.coerce.number().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  created_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  deleted_at: z.coerce.date().optional().nullable(),
  deleted_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  is_deleted: z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return false;
          }).optional().default(false).nullable(),
  late_threshold_minutes: z.coerce.number().nullable(),
  min_sessions_per_day: z.coerce.number().nullable(),
  moes_min_attendance_percent: z.coerce.number().nullable(),
  name: z.string(),
  school_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  sms_provider: z.string().nullable(),
  truant_definition: z.any().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
  updated_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
}).passthrough();

export type AttendancePoliciesType = z.infer<typeof AttendancePoliciesSchema>;
