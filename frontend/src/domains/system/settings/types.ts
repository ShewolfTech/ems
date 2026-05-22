// Auto-generated types for Settings domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Settings = {
  [K in keyof DB["settings"]]: Unwrap<DB["settings"][K]>;
};

export type CreateSettings = Omit<Settings, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateSettings = Partial<CreateSettings>;

export type SettingsPayload = {
  "category": Settings["category"];
  "is_active": Settings["isActive"];
  "key": Settings["key"];
  "value": Settings["value"];
};

export type SettingsInitialValues = SettingsPayload;
export type SettingsDefaultValues = Partial<SettingsPayload>;
export type SettingsFormValues = SettingsPayload;

export const SettingsMetadata = {
  resource: "settings",
  label: "Settings",
  fields: [
    { name: "category", label: "Category", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "key", label: "Key", uiType: "text", required: true },
    { name: "value", label: "Value", uiType: "text", required: true }
  ]
};
