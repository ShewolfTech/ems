// Auto-generated types for GradeLevels

/**
 * Represents the full GradeLevels record
 */
export type GradeLevelsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new GradeLevels
 */
export type CreateGradeLevelsInput = Partial<GradeLevelsType>;

/**
 * Represents the data required to update an existing GradeLevels
 */
export type UpdateGradeLevelsInput = Partial<GradeLevelsType>;
