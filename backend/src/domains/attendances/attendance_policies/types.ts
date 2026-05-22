// Auto-generated types for AttendancePolicies

/**
 * Represents the full AttendancePolicies record
 */
export type AttendancePoliciesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AttendancePolicies
 */
export type CreateAttendancePoliciesInput = Partial<AttendancePoliciesType>;

/**
 * Represents the data required to update an existing AttendancePolicies
 */
export type UpdateAttendancePoliciesInput = Partial<AttendancePoliciesType>;
