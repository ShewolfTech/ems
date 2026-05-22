// Auto-generated types for Terms domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Terms = {
  [K in keyof DB["terms"]]: Unwrap<DB["terms"][K]>;
};

export type CreateTerms = Omit<Terms, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateTerms = Partial<CreateTerms>;

export type TermsPayload = {
  "academic_year_id": Terms["academicYearId"];
  "code": Terms["code"];
  "end_date": Terms["endDate"];
  "is_active": Terms["isActive"];
  "name": Terms["name"];
  "start_date": Terms["startDate"];
};

export type TermsInitialValues = TermsPayload;
export type TermsDefaultValues = Partial<TermsPayload>;
export type TermsFormValues = TermsPayload;

export const TermsMetadata = {
  resource: "terms",
  label: "Terms",
  fields: [
    { name: "academic_year_id", label: "Academic Year Id", uiType: "number", required: true },
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "end_date", label: "End Date", uiType: "date", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "start_date", label: "Start Date", uiType: "date", required: true }
  ]
};
