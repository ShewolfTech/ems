// Auto-generated types for GradeLevels domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type GradeLevels = {
  [K in keyof DB["gradeLevels"]]: Unwrap<DB["gradeLevels"][K]>;
};

export type CreateGradeLevels = Omit<GradeLevels, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateGradeLevels = Partial<CreateGradeLevels>;

export type GradeLevelsPayload = {
  "code": GradeLevels["code"];
  "description": GradeLevels["description"];
  "display_order": GradeLevels["displayOrder"];
  "is_active": GradeLevels["isActive"];
  "name": GradeLevels["name"];
};

export type GradeLevelsInitialValues = GradeLevelsPayload;
export type GradeLevelsDefaultValues = Partial<GradeLevelsPayload>;
export type GradeLevelsFormValues = GradeLevelsPayload;

export const GradeLevelsMetadata = {
  resource: "gradeLevels",
  label: "Grade Levels",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "description", label: "Description", uiType: "text", required: false },
    { name: "display_order", label: "Display Order", uiType: "number", required: false },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: false },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
