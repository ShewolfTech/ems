// Auto-generated types for Genders domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Genders = {
  [K in keyof DB["genders"]]: Unwrap<DB["genders"][K]>;
};

export type CreateGenders = Omit<Genders, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateGenders = Partial<CreateGenders>;

export type GendersPayload = {
  "is_active": Genders["isActive"];
  "name": Genders["name"];
};

export type GendersInitialValues = GendersPayload;
export type GendersDefaultValues = Partial<GendersPayload>;
export type GendersFormValues = GendersPayload;

export const GendersMetadata = {
  resource: "genders",
  label: "Genders",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
