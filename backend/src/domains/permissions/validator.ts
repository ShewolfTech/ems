import { z } from "zod";

export const PermissionsSchema = z.object({
  id: z.string().uuid().optional(), // adjust if numeric IDs
  display_name: z.string().min(1).max(100),
  icon: z.string().max(50).optional().nullable(),
  is_menu_item: z.boolean().default(false),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  module: z.string().max(50).optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type Permission = z.infer<typeof PermissionsSchema>;