import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for Assets
 */
export const AssetsSchema = z.object({
  asset_code: z.string(),
  asset_type_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
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
  description: z.string().nullable(),
  id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  is_active: z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return true;
          }).optional().default(true).nullable(),
  is_deleted: z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return false;
          }).optional().default(false).nullable(),
  location: z.string().nullable(),
  name: z.string(),
  nfc_tag: z.string().nullable(),
  purchase_date: z.coerce.date().optional().nullable(),
  qr_code: z.string().nullable(),
  school_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  serial_number: z.string().nullable(),
  status: z.string(),
  updated_at: z.coerce.date().optional().nullable(),
  updated_by: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  vendor: z.string().nullable(),
  warranty_expiry: z.coerce.date().nullable(),
}).passthrough();

export type AssetsType = z.infer<typeof AssetsSchema>;
