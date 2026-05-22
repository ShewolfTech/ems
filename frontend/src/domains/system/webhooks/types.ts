// Auto-generated types for Webhooks domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Webhooks = {
  [K in keyof DB["webhooks"]]: Unwrap<DB["webhooks"][K]>;
};

export type CreateWebhooks = Omit<Webhooks, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateWebhooks = Partial<CreateWebhooks>;

export type WebhooksPayload = {
  "event": Webhooks["event"];
  "is_active": Webhooks["isActive"];
  "last_triggered": Webhooks["lastTriggered"];
  "name": Webhooks["name"];
  "secret": Webhooks["secret"];
  "url": Webhooks["url"];
};

export type WebhooksInitialValues = WebhooksPayload;
export type WebhooksDefaultValues = Partial<WebhooksPayload>;
export type WebhooksFormValues = WebhooksPayload;

export const WebhooksMetadata = {
  resource: "webhooks",
  label: "Webhooks",
  fields: [
    { name: "event", label: "Event", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "last_triggered", label: "Last Triggered", uiType: "date", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "secret", label: "Secret", uiType: "text", required: true },
    { name: "url", label: "Url", uiType: "text", required: true }
  ]
};
