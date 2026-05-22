// Auto-generated types for ContactTypes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type ContactTypes = {
  [K in keyof DB["contactTypes"]]: Unwrap<DB["contactTypes"][K]>;
};

export type CreateContactTypes = Omit<ContactTypes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateContactTypes = Partial<CreateContactTypes>;

export type ContactTypesPayload = {
  "is_active": ContactTypes["isActive"];
  "name": ContactTypes["name"];
};

export type ContactTypesInitialValues = ContactTypesPayload;
export type ContactTypesDefaultValues = Partial<ContactTypesPayload>;
export type ContactTypesFormValues = ContactTypesPayload;

export const ContactTypesMetadata = {
  resource: "contactTypes",
  label: "Contact Types",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
