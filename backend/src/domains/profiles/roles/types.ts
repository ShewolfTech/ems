// Auto-generated types for Roles

/**
 * Represents the full Roles record
 */
export type RolesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Roles
 */
export type CreateRolesInput = Partial<RolesType>;

/**
 * Represents the data required to update an existing Roles
 */
export type UpdateRolesInput = Partial<RolesType>;
