// Auto-generated types for Departments domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Departments = {
  [K in keyof DB["departments"]]: Unwrap<DB["departments"][K]>;
};

export type CreateDepartments = Omit<Departments, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateDepartments = Partial<CreateDepartments>;

export type DepartmentsPayload = {
  "code": Departments["code"];
  "description": Departments["description"];
  "is_active": Departments["isActive"];
  "name": Departments["name"];
};

export type DepartmentsInitialValues = DepartmentsPayload;
export type DepartmentsDefaultValues = Partial<DepartmentsPayload>;
export type DepartmentsFormValues = DepartmentsPayload;

export const DepartmentsMetadata = {
  resource: "departments",
  label: "Departments",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
