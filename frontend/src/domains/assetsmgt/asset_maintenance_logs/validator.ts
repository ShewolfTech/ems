import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AssetMaintenanceLogs
 */
export const AssetMaintenanceLogsSchema = z.object({
  asset_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  created_at: z.coerce.date().optional().nullable(),
  deleted_at: z.coerce.date().optional().nullable(),
  deleted_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  details: z.any().nullable(),
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
  logged_at: z.coerce.date().optional().nullable(),
  log_type: z.string(),
  resolution_notes: z.string().nullable(),
  resolved_at: z.coerce.date().optional().nullable(),
  technician_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  updated_at: z.coerce.date().optional().nullable(),
}).passthrough();

export type AssetMaintenanceLogsType = z.infer<typeof AssetMaintenanceLogsSchema>;
