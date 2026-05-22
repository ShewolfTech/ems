import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AttendanceRecords
 */
export const AttendanceRecordsSchema = z.object({
  asset_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  biometric_match_confidence: z.coerce.number().nullable(),
  biometric_scan_quality: z.string().nullable(),
  biometric_template_hash: z.string().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  deleted_at: z.coerce.date().optional().nullable(),
  deleted_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  device_code: z.string().nullable(),
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
  is_verified: z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return false;
          }).optional().default(false).nullable(),
  location_lat: z.coerce.number().nullable(),
  location_lng: z.coerce.number().nullable(),
  method: z.string(),
  recorded_at: z.coerce.date().optional().nullable(),
  recorded_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  remark: z.string().nullable(),
  school_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  session_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  sign_type: z.string().nullable(),
  status: z.string(),
  updated_at: z.coerce.date().optional().nullable(),
  user_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  verified_at: z.coerce.date().optional().nullable(),
  verified_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
}).passthrough();

export type AttendanceRecordsType = z.infer<typeof AttendanceRecordsSchema>;
