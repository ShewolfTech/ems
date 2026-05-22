// Auto-generated types for Timetables domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Timetables = {
  [K in keyof DB["timetables"]]: Unwrap<DB["timetables"][K]>;
};

export type CreateTimetables = Omit<Timetables, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateTimetables = Partial<CreateTimetables>;

export type TimetablesPayload = {
  "class_id": Timetables["classId"];
  "description": Timetables["description"];
  "is_active": Timetables["isActive"];
  "name": Timetables["name"];
  "term_id": Timetables["termId"];
};

export type TimetablesInitialValues = TimetablesPayload;
export type TimetablesDefaultValues = Partial<TimetablesPayload>;
export type TimetablesFormValues = TimetablesPayload;

export const TimetablesMetadata = {
  resource: "timetables",
  label: "Timetables",
  fields: [
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true }
  ]
};
