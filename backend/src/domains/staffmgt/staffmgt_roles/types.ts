// Auto-generated types for StaffmgtRoles

/**
 * Represents the full StaffmgtRoles record
 */
export type StaffmgtRolesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new StaffmgtRoles
 */
export type CreateStaffmgtRolesInput = Partial<StaffmgtRolesType>;

/**
 * Represents the data required to update an existing StaffmgtRoles
 */
export type UpdateStaffmgtRolesInput = Partial<StaffmgtRolesType>;
