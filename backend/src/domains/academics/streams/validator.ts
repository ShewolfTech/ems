import { z } from "zod";

export const StreamsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
}).passthrough();

export type StreamsType = z.infer<typeof StreamsSchema>;
