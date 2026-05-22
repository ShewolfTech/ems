// Auto-generated types for Roles domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Roles = {
  [K in keyof DB["roles"]]: Unwrap<DB["roles"][K]>;
};

export type CreateRoles = Omit<Roles, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateRoles = Partial<CreateRoles>;

export type RolesPayload = {
  "code": Roles["code"];
  "description": Roles["description"];
  "is_system": Roles["isSystem"];
  "module": Roles["module"];
  "name": Roles["name"];
};

export type RolesInitialValues = RolesPayload;
export type RolesDefaultValues = Partial<RolesPayload>;
export type RolesFormValues = RolesPayload;

export const RolesMetadata = {
  resource: "roles",
  label: "Roles",
  fields: [
    { name: "code", label: "Code", uiType: "number", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_system", label: "Is System", uiType: "boolean", required: true },
    { name: "module", label: "Module", uiType: "text", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
