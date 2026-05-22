// Auto-generated types for LeaveTypes

/**
 * Represents the full LeaveTypes record
 */
export type LeaveTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  code?: string;
  description?: string;
  max_days_per_year?: number;
  requires_document?: boolean;
  requires_approval?: boolean;
  is_paid?: boolean;
  is_for_students?: boolean;
  is_for_staff?: boolean;
  is_active?: boolean;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  is_deleted?: boolean;
  deleted_at?: Date;
  deleted_by?: number;
};

/**
 * Represents the data required to create a new LeaveTypes
 */
export type CreateLeaveTypesInput = Partial<LeaveTypesType>;

/**
 * Represents the data required to update an existing LeaveTypes
 */
export type UpdateLeaveTypesInput = Partial<LeaveTypesType>;
