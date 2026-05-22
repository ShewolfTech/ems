// Auto-generated types for Timetables

/**
 * Represents the full Timetables record
 */
export type TimetablesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Timetables
 */
export type CreateTimetablesInput = Partial<TimetablesType>;

/**
 * Represents the data required to update an existing Timetables
 */
export type UpdateTimetablesInput = Partial<TimetablesType>;
