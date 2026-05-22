// Auto-generated types for Students

/**
 * Represents the full Students record
 */
export type StudentsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Students
 */
export type CreateStudentsInput = Partial<StudentsType>;

/**
 * Represents the data required to update an existing Students
 */
export type UpdateStudentsInput = Partial<StudentsType>;
