// Auto-generated types for AttendanceStatus

/**
 * Represents the full AttendanceStatus record
 */
export type AttendanceStatusType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AttendanceStatus
 */
export type CreateAttendanceStatusInput = Partial<AttendanceStatusType>;

/**
 * Represents the data required to update an existing AttendanceStatus
 */
export type UpdateAttendanceStatusInput = Partial<AttendanceStatusType>;
