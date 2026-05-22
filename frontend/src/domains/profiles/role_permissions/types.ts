// Auto-generated types for RolePermissions domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type RolePermissions = {
  [K in keyof DB["rolePermissions"]]: Unwrap<DB["rolePermissions"][K]>;
};

export type CreateRolePermissions = Omit<RolePermissions, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateRolePermissions = Partial<CreateRolePermissions>;

export type RolePermissionsPayload = {
  "is_active": RolePermissions["isActive"];
  "permission_key": RolePermissions["permissionKey"];
  "role_id": RolePermissions["roleId"];
};

export type RolePermissionsInitialValues = RolePermissionsPayload;
export type RolePermissionsDefaultValues = Partial<RolePermissionsPayload>;
export type RolePermissionsFormValues = RolePermissionsPayload;

export const RolePermissionsMetadata = {
  resource: "rolePermissions",
  label: "Role Permissions",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "permission_key", label: "Permission Key", uiType: "text", required: true },
    { name: "role_id", label: "Role Id", uiType: "relation", relation: "roles", required: true }
  ]
};
