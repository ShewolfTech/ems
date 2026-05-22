// Auto-generated types for Schools

/**
 * Represents the full Schools record
 */
export type SchoolsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Schools
 */
export type CreateSchoolsInput = Partial<SchoolsType>;

/**
 * Represents the data required to update an existing Schools
 */
export type UpdateSchoolsInput = Partial<SchoolsType>;
