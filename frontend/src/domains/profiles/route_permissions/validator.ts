import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for RoutePermissions
 */
export const RoutePermissionsSchema = z.object({
  action: z.string(),
  created_at: z.coerce.date().optional().nullable(),
  display_name: z.string().nullable(),
  display_order: z.coerce.number().nullable(),
  icon: z.string().nullable(),
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
  is_global: z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return false;
          }).optional().default(false).nullable(),
  is_menu_item: z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return false;
          }).optional().default(false).nullable(),
  method: z.string(),
  module: z.string(),
  permission_key: z.string().nullable(),
  resource: z.string(),
  route: z.string(),
  route_type: z.string().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
}).passthrough();

export type RoutePermissionsType = z.infer<typeof RoutePermissionsSchema>;
