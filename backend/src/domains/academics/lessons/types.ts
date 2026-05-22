// Auto-generated types for Lessons

/**
 * Represents the full Lessons record
 */
export type LessonsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Lessons
 */
export type CreateLessonsInput = Partial<LessonsType>;

/**
 * Represents the data required to update an existing Lessons
 */
export type UpdateLessonsInput = Partial<LessonsType>;
