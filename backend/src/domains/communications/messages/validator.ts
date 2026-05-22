import { z } from "zod";

/**
 * Auto-generated Validator for Messages
 */
export const MessagesSchema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type MessagesType = z.infer<typeof MessagesSchema>;
