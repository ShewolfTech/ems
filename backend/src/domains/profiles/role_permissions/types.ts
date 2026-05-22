// Auto-generated types for RolePermissions

/**
 * Represents the full RolePermissions record
 */
export type RolePermissionsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new RolePermissions
 */
export type CreateRolePermissionsInput = Partial<RolePermissionsType>;

/**
 * Represents the data required to update an existing RolePermissions
 */
export type UpdateRolePermissionsInput = Partial<RolePermissionsType>;
