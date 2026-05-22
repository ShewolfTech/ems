// Auto-generated types for EmploymentTypes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type EmploymentTypes = {
  [K in keyof DB["employmentTypes"]]: Unwrap<DB["employmentTypes"][K]>;
};

export type CreateEmploymentTypes = Omit<EmploymentTypes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateEmploymentTypes = Partial<CreateEmploymentTypes>;

export type EmploymentTypesPayload = {
  "is_active": EmploymentTypes["isActive"];
  "name": EmploymentTypes["name"];
};

export type EmploymentTypesInitialValues = EmploymentTypesPayload;
export type EmploymentTypesDefaultValues = Partial<EmploymentTypesPayload>;
export type EmploymentTypesFormValues = EmploymentTypesPayload;

export const EmploymentTypesMetadata = {
  resource: "employmentTypes",
  label: "Employment Types",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
