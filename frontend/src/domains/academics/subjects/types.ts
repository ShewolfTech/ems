// Auto-generated types for Subjects domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Subjects = {
  [K in keyof DB["subjects"]]: Unwrap<DB["subjects"][K]>;
};

export type CreateSubjects = Omit<Subjects, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateSubjects = Partial<CreateSubjects>;

export type SubjectsPayload = {
  "code": Subjects["code"];
  "description": Subjects["description"];
  "is_active": Subjects["isActive"];
  "name": Subjects["name"];
};

export type SubjectsInitialValues = SubjectsPayload;
export type SubjectsDefaultValues = Partial<SubjectsPayload>;
export type SubjectsFormValues = SubjectsPayload;

export const SubjectsMetadata = {
  resource: "subjects",
  label: "Subjects",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
