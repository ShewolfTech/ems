import { z } from "zod";

/**
 * Validator for Grading Scale entries
 */
export const GradingScaleEntrySchema = z.object({
  grade: z.string().min(1, "Grade letter is required"),
  min_percentage: z.number().min(0).max(100),
  max_percentage: z.number().min(0).max(100),
  grade_point: z.number().min(0).max(5),
  description: z.string().optional().nullable(),
});

/**
 * Validator for Grading Configurations
 */
export const GradingConfigurationSchema = z.object({
  id: z.number().optional(),
  school_id: z.number().optional(),
  academic_year_id: z.number().optional().nullable(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional().nullable(),
  
  // Category weights (must sum to 100)
  assessments_weight: z.coerce.number()
    .min(0, "Assessments weight cannot be negative")
    .max(100, "Assessments weight cannot exceed 100")
    .default(40.0),
  exams_weight: z.coerce.number()
    .min(0, "Exams weight cannot be negative")
    .max(100, "Exams weight cannot exceed 100")
    .default(40.0),
  assignments_weight: z.coerce.number()
    .min(0, "Assignments weight cannot be negative")
    .max(100, "Assignments weight cannot exceed 100")
    .default(20.0),
  
  // Grading scale
  grading_scale: z.array(GradingScaleEntrySchema).min(1, "At least one grade entry required"),
  
  // Calculation method
  calculation_method: z.enum(['weighted_average', 'total_points', 'category_average'])
    .default('weighted_average'),
  
  // Settings
  round_final_grade: z.boolean().default(true),
  decimal_places: z.number().int().min(0).max(2).default(1),
  include_ungraded: z.boolean().default(false),
  
  // Status
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  effective_start_date: z.string().or(z.date()).optional().nullable(),
  effective_end_date: z.string().or(z.date()).optional().nullable(),
  
  created_by: z.number().optional().nullable(),
  updated_by: z.number().optional().nullable(),
}).passthrough().refine(
  (data) => {
    const total = data.assessments_weight + data.exams_weight + data.assignments_weight;
    return Math.abs(total - 100.0) < 0.01; // Allow small floating point errors
  },
  {
    message: "Category weights must sum to 100%",
    path: ["assessments_weight", "exams_weight", "assignments_weight"],
  }
);

export type GradingConfigurationType = z.infer<typeof GradingConfigurationSchema>;
export type GradingScaleEntryType = z.infer<typeof GradingScaleEntrySchema>;
