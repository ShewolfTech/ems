// Auto-generated types for Departments

/**
 * Represents the full Departments record
 */
export type DepartmentsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Departments
 */
export type CreateDepartmentsInput = Partial<DepartmentsType>;

/**
 * Represents the data required to update an existing Departments
 */
export type UpdateDepartmentsInput = Partial<DepartmentsType>;
