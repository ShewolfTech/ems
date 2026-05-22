// Auto-generated types for Attendances

/**
 * Represents the full Attendances record
 */
export type AttendancesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Attendances
 */
export type CreateAttendancesInput = Partial<AttendancesType>;

/**
 * Represents the data required to update an existing Attendances
 */
export type UpdateAttendancesInput = Partial<AttendancesType>;
