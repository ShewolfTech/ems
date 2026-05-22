// Leave Management Domain - Comprehensive Types

// Leave status types
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Leave category types
export type LeaveCategory = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid' | 'study' | 'compensatory' | 'other';

// Main leave request interface
export interface LeaveRequest {
  id: number;
  staff_id: number;
  staff_name?: string;
  employee_no?: string;
  department_name?: string;
  leave_type_id: number;
  leave_type_name?: string;
  leave_category?: LeaveCategory;
  leave_type_color?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  approved_by?: number;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  attachment_url?: string;
  is_half_day?: boolean;
  contact_during_leave?: string;
  work_coverage?: string;
}

// Leave type definition
export interface LeaveType {
  id: number;
  name: string;
  code: string;
  category: LeaveCategory;
  description?: string;
  max_days_per_year?: number;
  max_consecutive_days?: number;
  requires_approval: boolean;
  is_paid: boolean;
  is_active: boolean;
  color?: string;
  icon?: string;
}

// Leave quota for staff
export interface LeaveQuota {
  id: number;
  staff_id: number;
  staff_name?: string;
  leave_type_id: number;
  leave_type_name?: string;
  leave_type_color?: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  pending_days?: number;
}

// Leave calendar event
export interface LeaveCalendarEvent {
  id: number;
  staff_id: number;
  staff_name: string;
  leave_type_name: string;
  leave_type_color?: string;
  start_date: string;
  end_date: string;
  status: LeaveStatus;
  reason?: string;
}

// Leave dashboard statistics
export interface LeaveStatistics {
  total_pending: number;
  total_approved_this_month: number;
  total_rejected_this_month: number;
  total_leave_days_this_month: number;
  most_popular_leave_type: {
    name: string;
    count: number;
  };
  average_approval_time_hours: number;
  staff_on_leave_now: number;
  upcoming_returns: number; // Staff returning from leave in next 7 days
}

// Staff leave summary
export interface StaffLeaveSummary {
  staff_id: number;
  staff_name: string;
  department_name?: string;
  quotas: Array<{
    leave_type_name: string;
    leave_type_color?: string;
    total_days: number;
    used_days: number;
    remaining_days: number;
    pending_days: number;
  }>;
  current_leave_status?: 'on_leave' | 'active';
  current_leave_type?: string;
  current_leave_end_date?: string;
  total_leave_days_this_year: number;
}

// Filters for leave queries
export interface LeaveFilters {
  staff_id?: number;
  leave_type_id?: number;
  status?: LeaveStatus;
  date_from?: string;
  date_to?: string;
  department_id?: number;
  page?: number;
  limit?: number;
}

// Leave request form data
export interface LeaveRequestForm {
  staff_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url?: string;
  is_half_day?: boolean;
  contact_during_leave?: string;
  work_coverage?: string;
}

// Approval action
export interface ApprovalAction {
  leave_request_id: number;
  approved_by: number;
  reason?: string; // For rejections
}

// Leave type badge configuration
export const LeaveCategoryConfig: Record<LeaveCategory, { color: string; bg: string; label: string; icon: string }> = {
  annual: { color: 'text-teal-700', bg: 'bg-teal-100', label: 'Annual Leave', icon: '🏖' },
  sick: { color: 'text-red-700', bg: 'bg-red-100', label: 'Sick Leave', icon: '🏥' },
  personal: { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Personal Leave', icon: '👤' },
  maternity: { color: 'text-pink-700', bg: 'bg-pink-100', label: 'Maternity Leave', icon: '👶' },
  paternity: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Paternity Leave', icon: '👨' },
  bereavement: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Bereavement Leave', icon: '🕊' },
  unpaid: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Unpaid Leave', icon: '💰' },
  study: { color: 'text-indigo-700', bg: 'bg-indigo-100', label: 'Study Leave', icon: '📚' },
  compensatory: { color: 'text-green-700', bg: 'bg-green-100', label: 'Compensatory Leave', icon: '⚖' },
  other: { color: 'text-slate-700', bg: 'bg-slate-100', label: 'Other Leave', icon: '📋' },
};

export const LeaveStatusConfig: Record<LeaveStatus, { color: string; bg: string; label: string; icon: string }> = {
  pending: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Pending', icon: '⏳' },
  approved: { color: 'text-green-700', bg: 'bg-green-100', label: 'Approved', icon: '✓' },
  rejected: { color: 'text-red-700', bg: 'bg-red-100', label: 'Rejected', icon: '✗' },
  cancelled: { color: 'text-slate-700', bg: 'bg-slate-100', label: 'Cancelled', icon: '⊘' },
};
