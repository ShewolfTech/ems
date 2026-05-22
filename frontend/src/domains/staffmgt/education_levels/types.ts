// Auto-generated types for EducationLevels domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type EducationLevels = {
  [K in keyof DB["educationLevels"]]: Unwrap<DB["educationLevels"][K]>;
};

export type CreateEducationLevels = Omit<EducationLevels, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateEducationLevels = Partial<CreateEducationLevels>;

export type EducationLevelsPayload = {
  "description": EducationLevels["description"];
  "is_active": EducationLevels["isActive"];
  "name": EducationLevels["name"];
};

export type EducationLevelsInitialValues = EducationLevelsPayload;
export type EducationLevelsDefaultValues = Partial<EducationLevelsPayload>;
export type EducationLevelsFormValues = EducationLevelsPayload;

export const EducationLevelsMetadata = {
  resource: "educationLevels",
  label: "Education Levels",
  fields: [
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
