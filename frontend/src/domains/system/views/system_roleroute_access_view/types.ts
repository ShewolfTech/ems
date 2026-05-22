// Auto-generated types for SystemRolerouteAccessView domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type SystemRolerouteAccessView = {
  [K in keyof DB["systemRolerouteAccessView"]]: Unwrap<DB["systemRolerouteAccessView"][K]>;
};

export type CreateSystemRolerouteAccessView = Omit<SystemRolerouteAccessView, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateSystemRolerouteAccessView = Partial<CreateSystemRolerouteAccessView>;

export type SystemRolerouteAccessViewPayload = {
  "display_name": SystemRolerouteAccessView["displayName"];
  "method": SystemRolerouteAccessView["method"];
  "permission_key": SystemRolerouteAccessView["permissionKey"];
  "role_id": SystemRolerouteAccessView["roleId"];
  "role_name": SystemRolerouteAccessView["roleName"];
  "route": SystemRolerouteAccessView["route"];
};

export type SystemRolerouteAccessViewInitialValues = SystemRolerouteAccessViewPayload;
export type SystemRolerouteAccessViewDefaultValues = Partial<SystemRolerouteAccessViewPayload>;
export type SystemRolerouteAccessViewFormValues = SystemRolerouteAccessViewPayload;

export const SystemRolerouteAccessViewMetadata = {
  resource: "systemRolerouteAccessView",
  label: "System Roleroute Access View",
  fields: [
    { name: "display_name", label: "Display Name", uiType: "text", required: true },
    { name: "method", label: "Method", uiType: "text", required: true },
    { name: "permission_key", label: "Permission Key", uiType: "text", required: true },
    { name: "role_id", label: "Role Id", uiType: "relation", relation: "roles", required: true },
    { name: "role_name", label: "Role Name", uiType: "text", required: true },
    { name: "route", label: "Route", uiType: "text", required: true }
  ]
};
