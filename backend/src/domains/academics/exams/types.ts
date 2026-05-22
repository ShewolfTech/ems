// Auto-generated types for Exams

/**
 * Represents the full Exams record
 */
export type ExamsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Exams
 */
export type CreateExamsInput = Partial<ExamsType>;

/**
 * Represents the data required to update an existing Exams
 */
export type UpdateExamsInput = Partial<ExamsType>;
