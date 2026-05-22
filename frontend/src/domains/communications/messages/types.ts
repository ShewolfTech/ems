// Auto-generated types for Messages domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Messages = {
  [K in keyof DB["messages"]]: Unwrap<DB["messages"][K]>;
};

export type CreateMessages = Omit<Messages, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateMessages = Partial<CreateMessages>;

export type MessagesPayload = {
  "body": Messages["body"];
  "channel": Messages["channel"];
  "group_id": Messages["groupId"];
  "is_active": Messages["isActive"];
  "read_at": Messages["readAt"];
  "recipient_id": Messages["recipientId"];
  "sender_id": Messages["senderId"];
  "sent_at": Messages["sentAt"];
  "status": Messages["status"];
  "subject": Messages["subject"];
};

export type MessagesInitialValues = MessagesPayload;
export type MessagesDefaultValues = Partial<MessagesPayload>;
export type MessagesFormValues = MessagesPayload;

export const MessagesMetadata = {
  resource: "messages",
  label: "Messages",
  fields: [
    { name: "body", label: "Body", uiType: "text", required: true },
    { name: "channel", label: "Channel", uiType: "text", required: true },
    { name: "group_id", label: "Group Id", uiType: "number", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "read_at", label: "Read At", uiType: "date", required: true },
    { name: "recipient_id", label: "Recipient Id", uiType: "number", required: true },
    { name: "sender_id", label: "Sender Id", uiType: "number", required: true },
    { name: "sent_at", label: "Sent At", uiType: "date", required: true },
    { name: "status", label: "Status", uiType: "text", required: true },
    { name: "subject", label: "Subject", uiType: "text", required: true }
  ]
};
