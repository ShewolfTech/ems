// Auto-generated types for Districts domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Districts = {
  [K in keyof DB["districts"]]: Unwrap<DB["districts"][K]>;
};

export type CreateDistricts = Omit<Districts, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateDistricts = Partial<CreateDistricts>;

export type DistrictsPayload = {
  "code": Districts["code"];
  "is_active": Districts["isActive"];
  "name": Districts["name"];
};

export type DistrictsInitialValues = DistrictsPayload;
export type DistrictsDefaultValues = Partial<DistrictsPayload>;
export type DistrictsFormValues = DistrictsPayload;

export const DistrictsMetadata = {
  resource: "districts",
  label: "Districts",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
