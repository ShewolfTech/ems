// Auto-generated types for CustomFields domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type CustomFields = {
  [K in keyof DB["customFields"]]: Unwrap<DB["customFields"][K]>;
};

export type CreateCustomFields = Omit<CustomFields, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateCustomFields = Partial<CreateCustomFields>;

export type CustomFieldsPayload = {
  "default_value": CustomFields["defaultValue"];
  "entity_type": CustomFields["entityType"];
  "field_name": CustomFields["fieldName"];
  "field_type": CustomFields["fieldType"];
  "is_active": CustomFields["isActive"];
  "is_required": CustomFields["isRequired"];
  "options": CustomFields["options"];
};

export type CustomFieldsInitialValues = CustomFieldsPayload;
export type CustomFieldsDefaultValues = Partial<CustomFieldsPayload>;
export type CustomFieldsFormValues = CustomFieldsPayload;

export const CustomFieldsMetadata = {
  resource: "customFields",
  label: "Custom Fields",
  fields: [
    { name: "default_value", label: "Default Value", uiType: "text", required: true },
    { name: "entity_type", label: "Entity Type", uiType: "text", required: true },
    { name: "field_name", label: "Field Name", uiType: "text", required: true },
    { name: "field_type", label: "Field Type", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_required", label: "Is Required", uiType: "boolean", required: true },
    { name: "options", label: "Options", uiType: "multiselect", required: true }
  ]
};
