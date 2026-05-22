export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequestsType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  leave_type_id?: number;
  start_date?: Date;
  end_date?: Date;
  total_days?: number;
  reason?: string;
  status?: LeaveRequestStatus;
  approved_by?: number;
  approved_at?: Date;
  rejection_reason?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateLeaveRequestsInput = Partial<LeaveRequestsType>;
export type UpdateLeaveRequestsInput = Partial<LeaveRequestsType>;