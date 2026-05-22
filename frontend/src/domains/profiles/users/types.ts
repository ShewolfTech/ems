// Auto-generated types for Users domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Users = {
  [K in keyof DB["users"]]: Unwrap<DB["users"][K]>;
};

export type CreateUsers = Omit<Users, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateUsers = Partial<CreateUsers>;

export type UsersPayload = {
  "auth_uid": Users["authUid"];
  "date_of_birth": Users["dateOfBirth"];
  "email": Users["email"];
  "first_name": Users["firstName"];
  "is_active": Users["isActive"];
  "last_login": Users["lastLogin"];
  "last_name": Users["lastName"];
  "nationality": Users["nationality"];
  "password": Users["password"];
  "phone": Users["phone"];
  "role_id": Users["roleId"];
  "username": Users["username"];
};

export type UsersInitialValues = UsersPayload;
export type UsersDefaultValues = Partial<UsersPayload>;
export type UsersFormValues = UsersPayload;

export const UsersMetadata = {
  resource: "users",
  label: "Users",
  fields: [
    { name: "auth_uid", label: "Auth Uid", uiType: "text", required: true },
    { name: "date_of_birth", label: "Date Of Birth", uiType: "date", required: true },
    { name: "email", label: "Email", uiType: "text", required: true },
    { name: "first_name", label: "First Name", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "last_login", label: "Last Login", uiType: "date", required: true },
    { name: "last_name", label: "Last Name", uiType: "text", required: true },
    { name: "nationality", label: "Nationality", uiType: "text", required: true },
    { name: "password", label: "Password", uiType: "text", required: true },
    { name: "phone", label: "Phone", uiType: "text", required: true },
    { name: "role_id", label: "Role Id", uiType: "relation", relation: "roles", required: true },
    { name: "username", label: "Username", uiType: "text", required: true }
  ]
};
