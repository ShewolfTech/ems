export type AttendanceStatus = "present" | "absent" | "late" | " excused" | "on-leave";

export type StaffAttendanceType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  date?: Date;
  clock_in_time?: Date;
  clock_out_time?: Date;
  late_minutes?: number;
  early_leave_minutes?: number;
  total_hours?: number;
  status?: AttendanceStatus;
  notes?: string;
  device_id?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateStaffAttendanceInput = Partial<StaffAttendanceType>;
export type UpdateStaffAttendanceInput = Partial<StaffAttendanceType>;