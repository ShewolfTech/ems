// Auto-generated types for Schools domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Schools = {
  [K in keyof DB["schools"]]: Unwrap<DB["schools"][K]>;
};

export type CreateSchools = Omit<Schools, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateSchools = Partial<CreateSchools>;

export type SchoolsPayload = {
  "address": Schools["address"];
  "code": Schools["code"];
  "contact_email": Schools["contactEmail"];
  "contact_phone": Schools["contactPhone"];
  "district_id": Schools["districtId"];
  "is_active": Schools["isActive"];
  "logo_url": Schools["logoUrl"];
  "name": Schools["name"];
  "settings": Schools["settings"];
  "timezone": Schools["timezone"];
};

export type SchoolsInitialValues = SchoolsPayload;
export type SchoolsDefaultValues = Partial<SchoolsPayload>;
export type SchoolsFormValues = SchoolsPayload;

export const SchoolsMetadata = {
  resource: "schools",
  label: "Schools",
  fields: [
    { name: "address", label: "Address", uiType: "text", required: true },
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "contact_email", label: "Contact Email", uiType: "text", required: true },
    { name: "contact_phone", label: "Contact Phone", uiType: "text", required: true },
    { name: "district_id", label: "District Id", uiType: "relation", relation: "districts", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "logo_url", label: "Logo Url", uiType: "text", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "settings", label: "Settings", uiType: "json", required: true },
    { name: "timezone", label: "Timezone", uiType: "text", required: true }
  ]
};
