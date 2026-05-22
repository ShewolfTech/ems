export type LeaveCategory = "annual" | "sick" | "personal" | "maternity" | "paternity" | "bereavement" | "unpaid" | "other";

export type LeaveTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  category?: LeaveCategory;
  description?: string;
  max_days_per_year?: number;
  max_consecutive_days?: number;
  requires_approval?: boolean;
  is_paid?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateLeaveTypesInput = Partial<LeaveTypesType>;
export type UpdateLeaveTypesInput = Partial<LeaveTypesType>;