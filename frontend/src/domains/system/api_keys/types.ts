// Auto-generated types for ApiKeys domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type ApiKeys = {
  [K in keyof DB["apiKeys"]]: Unwrap<DB["apiKeys"][K]>;
};

export type CreateApiKeys = Omit<ApiKeys, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateApiKeys = Partial<CreateApiKeys>;

export type ApiKeysPayload = {
  "expires_at": ApiKeys["expiresAt"];
  "is_active": ApiKeys["isActive"];
  "key_hash": ApiKeys["keyHash"];
  "last_used": ApiKeys["lastUsed"];
  "name": ApiKeys["name"];
  "scopes": ApiKeys["scopes"];
};

export type ApiKeysInitialValues = ApiKeysPayload;
export type ApiKeysDefaultValues = Partial<ApiKeysPayload>;
export type ApiKeysFormValues = ApiKeysPayload;

export const ApiKeysMetadata = {
  resource: "apiKeys",
  label: "Api Keys",
  fields: [
    { name: "expires_at", label: "Expires At", uiType: "date", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "key_hash", label: "Key Hash", uiType: "text", required: true },
    { name: "last_used", label: "Last Used", uiType: "date", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "scopes", label: "Scopes", uiType: "multiselect", required: true }
  ]
};
