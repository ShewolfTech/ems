// Auto-generated types for Lessons domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Lessons = {
  [K in keyof DB["lessons"]]: Unwrap<DB["lessons"][K]>;
};

export type CreateLessons = Omit<Lessons, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateLessons = Partial<CreateLessons>;

export type LessonsPayload = {
  "class_id": Lessons["classId"];
  "description": Lessons["description"];
  "end_time": Lessons["endTime"];
  "is_active": Lessons["isActive"];
  "resources": Lessons["resources"];
  "scheduled_date": Lessons["scheduledDate"];
  "start_time": Lessons["startTime"];
  "status_id": Lessons["statusId"];
  "subject_id": Lessons["subjectId"];
  "teacher_comments": Lessons["teacherComments"];
  "teacher_id": Lessons["teacherId"];
  "term_id": Lessons["termId"];
  "title": Lessons["title"];
};

export type LessonsInitialValues = LessonsPayload;
export type LessonsDefaultValues = Partial<LessonsPayload>;
export type LessonsFormValues = LessonsPayload;

export const LessonsMetadata = {
  resource: "lessons",
  label: "Lessons",
  fields: [
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "end_time", label: "End Time", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "resources", label: "Resources", uiType: "json", required: true },
    { name: "scheduled_date", label: "Scheduled Date", uiType: "date", required: true },
    { name: "start_time", label: "Start Time", uiType: "text", required: true },
    { name: "status_id", label: "Status Id", uiType: "number", required: true },
    { name: "subject_id", label: "Subject Id", uiType: "relation", relation: "subjects", required: true },
    { name: "teacher_comments", label: "Teacher Comments", uiType: "json", required: true },
    { name: "teacher_id", label: "Teacher Id", uiType: "number", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true },
    { name: "title", label: "Title", uiType: "text", required: true }
  ]
};
