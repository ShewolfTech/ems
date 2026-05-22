// Auto-generated types for UserPermissions

/**
 * Represents the full UserPermissions record
 */
export type UserPermissionsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new UserPermissions
 */
export type CreateUserPermissionsInput = Partial<UserPermissionsType>;

/**
 * Represents the data required to update an existing UserPermissions
 */
export type UpdateUserPermissionsInput = Partial<UserPermissionsType>;
