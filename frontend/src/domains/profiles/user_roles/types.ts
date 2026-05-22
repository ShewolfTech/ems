// Auto-generated types for UserRoles domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type UserRoles = {
  [K in keyof DB["userRoles"]]: Unwrap<DB["userRoles"][K]>;
};

export type CreateUserRoles = Omit<UserRoles, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateUserRoles = Partial<CreateUserRoles>;

export type UserRolesPayload = {
  "is_active": UserRoles["isActive"];
  "role_id": UserRoles["roleId"];
};

export type UserRolesInitialValues = UserRolesPayload;
export type UserRolesDefaultValues = Partial<UserRolesPayload>;
export type UserRolesFormValues = UserRolesPayload;

export const UserRolesMetadata = {
  resource: "userRoles",
  label: "User Roles",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "role_id", label: "Role Id", uiType: "relation", relation: "roles", required: true }
  ]
};
