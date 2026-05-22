// Auto-generated types for UserPermissions domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type UserPermissions = {
  [K in keyof DB["userPermissions"]]: Unwrap<DB["userPermissions"][K]>;
};

export type CreateUserPermissions = Omit<UserPermissions, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateUserPermissions = Partial<CreateUserPermissions>;

export type UserPermissionsPayload = {
  "action": UserPermissions["action"];
  "is_active": UserPermissions["isActive"];
  "is_allowed": UserPermissions["isAllowed"];
  "module": UserPermissions["module"];
  "permission_id": UserPermissions["permissionId"];
  "resource": UserPermissions["resource"];
  "revoked_at": UserPermissions["revokedAt"];
  "revoked_by": UserPermissions["revokedBy"];
};

export type UserPermissionsInitialValues = UserPermissionsPayload;
export type UserPermissionsDefaultValues = Partial<UserPermissionsPayload>;
export type UserPermissionsFormValues = UserPermissionsPayload;

export const UserPermissionsMetadata = {
  resource: "userPermissions",
  label: "User Permissions",
  fields: [
    { name: "action", label: "Action", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_allowed", label: "Is Allowed", uiType: "boolean", required: true },
    { name: "module", label: "Module", uiType: "text", required: true },
    { name: "permission_id", label: "Permission Id", uiType: "relation", relation: "permissions", required: true },
    { name: "resource", label: "Resource", uiType: "text", required: true },
    { name: "revoked_at", label: "Revoked At", uiType: "date", required: true },
    { name: "revoked_by", label: "Revoked By", uiType: "number", required: true }
  ]
};
