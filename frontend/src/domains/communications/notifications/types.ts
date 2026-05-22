// Auto-generated types for Notifications domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Notifications = {
  [K in keyof DB["notifications"]]: Unwrap<DB["notifications"][K]>;
};

export type CreateNotifications = Omit<Notifications, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateNotifications = Partial<CreateNotifications>;

export type NotificationsPayload = {
  "body": Notifications["body"];
  "channel": Notifications["channel"];
  "is_active": Notifications["isActive"];
  "is_read": Notifications["isRead"];
  "sent_at": Notifications["sentAt"];
  "title": Notifications["title"];
  "type": Notifications["type"];
};

export type NotificationsInitialValues = NotificationsPayload;
export type NotificationsDefaultValues = Partial<NotificationsPayload>;
export type NotificationsFormValues = NotificationsPayload;

export const NotificationsMetadata = {
  resource: "notifications",
  label: "Notifications",
  fields: [
    { name: "body", label: "Body", uiType: "text", required: true },
    { name: "channel", label: "Channel", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_read", label: "Is Read", uiType: "boolean", required: true },
    { name: "sent_at", label: "Sent At", uiType: "date", required: true },
    { name: "title", label: "Title", uiType: "text", required: true },
    { name: "type", label: "Type", uiType: "text", required: true }
  ]
};
