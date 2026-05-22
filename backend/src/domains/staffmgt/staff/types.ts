// Auto-generated types for Staff

/**
 * Represents the full Staff record
 */
export type StaffType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Staff
 */
export type CreateStaffInput = Partial<StaffType>;

/**
 * Represents the data required to update an existing Staff
 */
export type UpdateStaffInput = Partial<StaffType>;
