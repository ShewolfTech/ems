// Auto-generated types for AttendanceSessions

/**
 * Represents the full AttendanceSessions record
 */
export type AttendanceSessionsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AttendanceSessions
 */
export type CreateAttendanceSessionsInput = Partial<AttendanceSessionsType>;

/**
 * Represents the data required to update an existing AttendanceSessions
 */
export type UpdateAttendanceSessionsInput = Partial<AttendanceSessionsType>;
