// Auto-generated types for EmploymentTypes

/**
 * Represents the full EmploymentTypes record
 */
export type EmploymentTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new EmploymentTypes
 */
export type CreateEmploymentTypesInput = Partial<EmploymentTypesType>;

/**
 * Represents the data required to update an existing EmploymentTypes
 */
export type UpdateEmploymentTypesInput = Partial<EmploymentTypesType>;
