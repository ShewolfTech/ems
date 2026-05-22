import { z } from "zod";

/**
 * Auto-generated Validator for Terms
 */
export const TermsSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  academic_year_id: z.number().optional(),
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type TermsType = z.infer<typeof TermsSchema>;
