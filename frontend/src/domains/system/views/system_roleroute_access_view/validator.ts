import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for SystemRolerouteAccessView
 */
export const SystemRolerouteAccessViewSchema = z.object({
  display_name: z.string().nullable(),
  method: z.string().nullable(),
  permission_key: z.string().nullable(),
  role_id: z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable()),
  role_name: z.string().nullable(),
  route: z.string().nullable(),
}).passthrough();

export type SystemRolerouteAccessViewType = z.infer<typeof SystemRolerouteAccessViewSchema>;
