// Auto-generated types for Leaves

/**
 * Represents the full Leaves record
 */
export type LeavesType = {
  id?: number;
  school_id?: number;
  user_id?: number;
  leave_type_id?: number;
  start_date?: Date | string;
  end_date?: Date | string;
  reason?: string;
  document_url?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  applied_at?: Date | string;
  approved_by?: number;
  approved_at?: Date | string;
  reject_reason?: string;
  is_emergency?: boolean;
  created_at?: Date | string;
  created_by?: number;
  updated_at?: Date | string;
  updated_by?: number;
  is_deleted?: boolean;
  deleted_at?: Date | string;
  deleted_by?: number;
};

/**
 * Represents the data required to create a new Leaves
 */
export type CreateLeavesInput = {
  user_id: number;
  leave_type_id: number;
  start_date: Date | string;
  end_date: Date | string;
  reason: string;
  document_url?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  applied_at?: Date | string;
  approved_by?: number;
  approved_at?: Date | string;
  reject_reason?: string;
  is_emergency?: boolean;
  created_by?: number;
};

/**
 * Represents the data required to update an existing Leaves
 */
export type UpdateLeavesInput = Partial<Omit<LeavesType, 'id' | 'school_id' | 'user_id'>>;
