// Auto-generated types for RoutePermissions

/**
 * Represents the full RoutePermissions record
 */
export type RoutePermissionsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new RoutePermissions
 */
export type CreateRoutePermissionsInput = Partial<RoutePermissionsType>;

/**
 * Represents the data required to update an existing RoutePermissions
 */
export type UpdateRoutePermissionsInput = Partial<RoutePermissionsType>;
