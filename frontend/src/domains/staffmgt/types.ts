export type StaffStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type JobStatus = 'draft' | 'posted' | 'closed';

export interface StaffMember {
  id: number;
  school_id: number;
  user_id: number;
  employee_no: string;
  hire_date: string;
  department_id?: number;
  role_id?: number;
  is_active: boolean;
  // Joined from users table
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface StaffContract {
  id: number;
  staff_id: number;
  contract_number: string;
  contract_type: string;
  job_title: string;
  start_date: string;
  end_date?: string;
  salary: number;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  signed_at?: string;
}

export interface StaffAttendance {
  id: number;
  staff_id: number;
  date: string;
  clock_in_time?: string;
  clock_out_time?: string;
  late_minutes: number;
  total_hours?: number;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: number;
  staff_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  rejection_reason?: string;
  // Joined from staff/users
  staff_name?: string;
  leave_type_name?: string;
}

export interface JobPosting {
  id: number;
  title: string;
  department_id?: number;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  status: JobStatus;
  closing_date?: string;
}

export interface PerformanceReview {
  id: number;
  staff_id: number;
  reviewer_id: number;
  review_period_start: string;
  review_period_end: string;
  overall_rating: number;
  status: 'draft' | 'completed';
  strengths: string;
  areas_for_improvement: string;
}

export interface StaffPayroll {
  id: number;
  staff_id: number;
  bank_name?: string;
  bank_account_number?: string;
  base_salary: number;
  net_salary: number;
  last_paid_date?: string;
}

export interface StaffStats {
  total_staff: number;
  active_staff: number;
  on_leave: number;
  attendance_today: {
    present: number;
    absent: number;
    late: number;
  };
}

export interface LeaveQuota {
  id: number;
  leave_type_id: number;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  leave_type_name?: string;
  leave_type_code?: string;
}