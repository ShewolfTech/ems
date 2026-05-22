// Auto-generated types for Classes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Classes = {
  [K in keyof DB["classes"]]: Unwrap<DB["classes"][K]>;
};

export type CreateClasses = Omit<Classes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateClasses = Partial<CreateClasses>;

export type ClassesPayload = {
  "academic_year": Classes["academicYear"];
  "capacity": Classes["capacity"];
  "class_teacher_id": Classes["classTeacherId"];
  "code": Classes["code"];
  "grade_level_id": Classes["gradeLevelId"];
  "is_active": Classes["isActive"];
  "name": Classes["name"];
  "room": Classes["room"];
  "stream_id": Classes["streamId"];
  "teacher_id": Classes["teacherId"];
};

export type ClassesInitialValues = ClassesPayload;
export type ClassesDefaultValues = Partial<ClassesPayload>;
export type ClassesFormValues = ClassesPayload;

export const ClassesMetadata = {
  resource: "classes",
  label: "Classes",
  fields: [
    { name: "academic_year", label: "Academic Year", uiType: "text", required: true },
    { name: "capacity", label: "Capacity", uiType: "number", required: false },
    { name: "class_teacher_id", label: "Class Teacher Id", uiType: "number", required: false },
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "grade_level_id", label: "Grade Level Id", uiType: "number", required: false },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: false },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "room", label: "Room", uiType: "text", required: false },
    { name: "stream_id", label: "Stream Id", uiType: "number", required: false },
    { name: "teacher_id", label: "Teacher Id", uiType: "number", required: false }
  ]
};
