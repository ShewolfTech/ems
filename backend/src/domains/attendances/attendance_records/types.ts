// Auto-generated types for AttendanceRecords

/**
 * Represents the full AttendanceRecords record
 */
export type AttendanceRecordsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AttendanceRecords
 */
export type CreateAttendanceRecordsInput = Partial<AttendanceRecordsType>;

/**
 * Represents the data required to update an existing AttendanceRecords
 */
export type UpdateAttendanceRecordsInput = Partial<AttendanceRecordsType>;
