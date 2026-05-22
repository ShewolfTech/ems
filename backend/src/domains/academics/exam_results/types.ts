// Auto-generated types for ExamResults

/**
 * Represents the full ExamResults record
 */
export type ExamResultsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ExamResults
 */
export type CreateExamResultsInput = Partial<ExamResultsType>;

/**
 * Represents the data required to update an existing ExamResults
 */
export type UpdateExamResultsInput = Partial<ExamResultsType>;
