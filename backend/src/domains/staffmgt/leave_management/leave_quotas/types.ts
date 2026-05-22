export type LeaveQuotasType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  leave_type_id?: number;
  year?: number;
  total_days?: number;
  used_days?: number;
  remaining_days?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateLeaveQuotasInput = Partial<LeaveQuotasType>;
export type UpdateLeaveQuotasInput = Partial<LeaveQuotasType>;