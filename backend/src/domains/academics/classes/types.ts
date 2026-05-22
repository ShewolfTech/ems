// Auto-generated types for Classes

/**
 * Represents the full Classes record
 */
export type ClassesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Classes
 */
export type CreateClassesInput = Partial<ClassesType>;

/**
 * Represents the data required to update an existing Classes
 */
export type UpdateClassesInput = Partial<ClassesType>;
