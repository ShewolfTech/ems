// Auto-generated types for AcademicYears domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AcademicYears = {
  [K in keyof DB["academicYears"]]: Unwrap<DB["academicYears"][K]>;
};

export type CreateAcademicYears = Omit<AcademicYears, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAcademicYears = Partial<CreateAcademicYears>;

export type AcademicYearsPayload = {
  "end_date": AcademicYears["endDate"];
  "is_active": AcademicYears["isActive"];
  "is_current": AcademicYears["isCurrent"];
  "name": AcademicYears["name"];
  "start_date": AcademicYears["startDate"];
};

export type AcademicYearsInitialValues = AcademicYearsPayload;
export type AcademicYearsDefaultValues = Partial<AcademicYearsPayload>;
export type AcademicYearsFormValues = AcademicYearsPayload;

export const AcademicYearsMetadata = {
  resource: "academicYears",
  label: "Academic Years",
  fields: [
    { name: "end_date", label: "End Date", uiType: "date", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_current", label: "Is Current", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "start_date", label: "Start Date", uiType: "date", required: true }
  ]
};
