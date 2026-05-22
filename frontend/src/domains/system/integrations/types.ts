// Auto-generated types for Integrations domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Integrations = {
  [K in keyof DB["integrations"]]: Unwrap<DB["integrations"][K]>;
};

export type CreateIntegrations = Omit<Integrations, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateIntegrations = Partial<CreateIntegrations>;

export type IntegrationsPayload = {
  "config": Integrations["config"];
  "is_active": Integrations["isActive"];
  "last_synced": Integrations["lastSynced"];
  "name": Integrations["name"];
  "type": Integrations["type"];
};

export type IntegrationsInitialValues = IntegrationsPayload;
export type IntegrationsDefaultValues = Partial<IntegrationsPayload>;
export type IntegrationsFormValues = IntegrationsPayload;

export const IntegrationsMetadata = {
  resource: "integrations",
  label: "Integrations",
  fields: [
    { name: "config", label: "Config", uiType: "json", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "last_synced", label: "Last Synced", uiType: "date", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "type", label: "Type", uiType: "text", required: true }
  ]
};
