// Auto-generated types for DocumentTypes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type DocumentTypes = {
  [K in keyof DB["documentTypes"]]: Unwrap<DB["documentTypes"][K]>;
};

export type CreateDocumentTypes = Omit<DocumentTypes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateDocumentTypes = Partial<CreateDocumentTypes>;

export type DocumentTypesPayload = {
  "is_active": DocumentTypes["isActive"];
  "name": DocumentTypes["name"];
};

export type DocumentTypesInitialValues = DocumentTypesPayload;
export type DocumentTypesDefaultValues = Partial<DocumentTypesPayload>;
export type DocumentTypesFormValues = DocumentTypesPayload;

export const DocumentTypesMetadata = {
  resource: "documentTypes",
  label: "Document Types",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
