// Auto-generated types for Subjects

/**
 * Represents the full Subjects record
 */
export type SubjectsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Subjects
 */
export type CreateSubjectsInput = Partial<SubjectsType>;

/**
 * Represents the data required to update an existing Subjects
 */
export type UpdateSubjectsInput = Partial<SubjectsType>;
