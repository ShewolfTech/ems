// Auto-generated types for Assessments

/**
 * Represents the full Assessments record
 */
export type AssessmentsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Assessments
 */
export type CreateAssessmentsInput = Partial<AssessmentsType>;

/**
 * Represents the data required to update an existing Assessments
 */
export type UpdateAssessmentsInput = Partial<AssessmentsType>;
