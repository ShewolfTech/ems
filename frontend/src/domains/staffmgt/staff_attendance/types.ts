// Staff Attendance Domain - Comprehensive Types

// Attendance status types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'on_leave' | 'half_day';

// Time tracking types
export interface TimeRecord {
  hours: number;
  minutes: number;
}

// Main attendance record
export interface AttendanceRecord {
  id: number;
  staff_id: number;
  staff_name?: string;
  employee_no?: string;
  department_name?: string;
  date: string;
  clock_in_time?: string;
  clock_out_time?: string;
  late_minutes: number;
  early_leave_minutes: number;
  total_hours: number;
  status: AttendanceStatus;
  notes?: string;
  device_id?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Daily summary for dashboard
export interface DailySummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  on_leave: number;
  half_day: number;
  total_staff: number;
  attendance_percentage: number;
}

// Weekly/Monthly analytics
export interface AttendanceAnalytics {
  period: 'week' | 'month' | 'custom';
  start_date: string;
  end_date: string;
  daily_summaries: DailySummary[];
  average_attendance_rate: number;
  most_punctual_staff: Array<{
    staff_id: number;
    staff_name: string;
    on_time_percentage: number;
  }>;
  most_late_staff: Array<{
    staff_id: number;
    staff_name: string;
    total_late_minutes: number;
  }>;
  department_stats: Array<{
    department_id: number;
    department_name: string;
    average_attendance_rate: number;
    average_late_minutes: number;
  }>;
}

// Filters for attendance queries
export interface AttendanceFilters {
  staff_id?: number;
  department_id?: number;
  date_from?: string;
  date_to?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

// Clock-in/out request
export interface ClockRequest {
  staff_id: number;
  device_id?: string;
  location?: string;
}

// Attendance statistics
export interface AttendanceStatistics {
  today_present: number;
  today_absent: number;
  today_late: number;
  today_percentage: number;
  week_average: number;
  month_average: number;
  total_late_this_month: number;
  total_absences_this_month: number;
}

// Staff monthly summary
export interface StaffMonthlySummary {
  staff_id: number;
  staff_name: string;
  month: number;
  year: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  leave_days: number;
  half_days: number;
  total_hours: number;
  average_hours_per_day: number;
  on_time_percentage: number;
}

// Working hours configuration
export interface WorkingHoursConfig {
  start_time: string;
  end_time: string;
  late_grace_minutes: number;
  minimum_hours_per_day: number;
  working_days: number[]; // 0=Sunday, 1=Monday, etc.
}

// Status badge configuration
export const StatusConfig: Record<AttendanceStatus, { color: string; bg: string; label: string; icon: string }> = {
  present: { color: 'text-green-700', bg: 'bg-green-100', label: 'Present', icon: '✓' },
  absent: { color: 'text-red-700', bg: 'bg-red-100', label: 'Absent', icon: '✗' },
  late: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Late', icon: '⏱' },
  excused: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Excused', icon: 'ℹ' },
  on_leave: { color: 'text-purple-700', bg: 'bg-purple-100', label: 'On Leave', icon: '🏖' },
  half_day: { color: 'text-teal-700', bg: 'bg-teal-100', label: 'Half Day', icon: '½' },
};

// Default working hours
export const DefaultWorkingHours: WorkingHoursConfig = {
  start_time: '08:00',
  end_time: '17:00',
  late_grace_minutes: 15,
  minimum_hours_per_day: 8,
  working_days: [1, 2, 3, 4, 5], // Monday to Friday
};
