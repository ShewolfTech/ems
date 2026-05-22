// Auto-generated types for Files domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Files = {
  [K in keyof DB["files"]]: Unwrap<DB["files"][K]>;
};

export type CreateFiles = Omit<Files, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateFiles = Partial<CreateFiles>;

export type FilesPayload = {
  "description": Files["description"];
  "file_type": Files["fileType"];
  "is_active": Files["isActive"];
  "is_public": Files["isPublic"];
  "mime_type": Files["mimeType"];
  "name": Files["name"];
  "owner_id": Files["ownerId"];
  "size": Files["size"];
  "storage_url": Files["storageUrl"];
  "uploaded_at": Files["uploadedAt"];
};

export type FilesInitialValues = FilesPayload;
export type FilesDefaultValues = Partial<FilesPayload>;
export type FilesFormValues = FilesPayload;

export const FilesMetadata = {
  resource: "files",
  label: "Files",
  fields: [
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "file_type", label: "File Type", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_public", label: "Is Public", uiType: "boolean", required: true },
    { name: "mime_type", label: "Mime Type", uiType: "text", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "owner_id", label: "Owner Id", uiType: "number", required: true },
    { name: "size", label: "Size", uiType: "number", required: true },
    { name: "storage_url", label: "Storage Url", uiType: "text", required: true },
    { name: "uploaded_at", label: "Uploaded At", uiType: "date", required: true }
  ]
};
