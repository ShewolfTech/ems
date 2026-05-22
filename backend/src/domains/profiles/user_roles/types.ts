// Auto-generated types for UserRoles

/**
 * Represents the full UserRoles record
 */
export type UserRolesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new UserRoles
 */
export type CreateUserRolesInput = Partial<UserRolesType>;

/**
 * Represents the data required to update an existing UserRoles
 */
export type UpdateUserRolesInput = Partial<UserRolesType>;
