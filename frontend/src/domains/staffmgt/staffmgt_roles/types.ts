// Auto-generated types for StaffmgtRoles domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type StaffmgtRoles = {
  [K in keyof DB["staffmgtRoles"]]: Unwrap<DB["staffmgtRoles"][K]>;
};

export type CreateStaffmgtRoles = Omit<StaffmgtRoles, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateStaffmgtRoles = Partial<CreateStaffmgtRoles>;

export type StaffmgtRolesPayload = {
  "code": StaffmgtRoles["code"];
  "description": StaffmgtRoles["description"];
  "is_active": StaffmgtRoles["isActive"];
  "name": StaffmgtRoles["name"];
};

export type StaffmgtRolesInitialValues = StaffmgtRolesPayload;
export type StaffmgtRolesDefaultValues = Partial<StaffmgtRolesPayload>;
export type StaffmgtRolesFormValues = StaffmgtRolesPayload;

export const StaffmgtRolesMetadata = {
  resource: "staffmgtRoles",
  label: "Staffmgt Roles",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
