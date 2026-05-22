// Auto-generated types for EducationLevels

/**
 * Represents the full EducationLevels record
 */
export type EducationLevelsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new EducationLevels
 */
export type CreateEducationLevelsInput = Partial<EducationLevelsType>;

/**
 * Represents the data required to update an existing EducationLevels
 */
export type UpdateEducationLevelsInput = Partial<EducationLevelsType>;
