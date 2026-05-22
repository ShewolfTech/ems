import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for AssetAssignments
 */
export const AssetAssignmentsSchema = z.object({
  asset_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  assigned_at: z.coerce.date().optional().nullable(),
  assigned_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  assignment_type: z.string(),
  created_at: z.coerce.date().optional().nullable(),
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
  notes: z.string().nullable(),
  unassigned_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
  user_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
}).passthrough();

export type AssetAssignmentsType = z.infer<typeof AssetAssignmentsSchema>;
