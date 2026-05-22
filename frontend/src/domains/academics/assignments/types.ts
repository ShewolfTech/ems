// Auto-generated types for Assignments domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Assignments = {
  [K in keyof DB["assignments"]]: Unwrap<DB["assignments"][K]>;
};

export type CreateAssignments = Omit<Assignments, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAssignments = Partial<CreateAssignments>;

export type AssignmentsPayload = {
  "class_id": Assignments["classId"];
  "description": Assignments["description"];
  "due_date": Assignments["dueDate"];
  "is_active": Assignments["isActive"];
  "max_score": Assignments["maxScore"];
  "status_id": Assignments["statusId"];
  "subject_id": Assignments["subjectId"];
  "teacher_comments": Assignments["teacherComments"];
  "teacher_id": Assignments["teacherId"];
  "term_id": Assignments["termId"];
  "title": Assignments["title"];
};

export type AssignmentsInitialValues = AssignmentsPayload;
export type AssignmentsDefaultValues = Partial<AssignmentsPayload>;
export type AssignmentsFormValues = AssignmentsPayload;

export const AssignmentsMetadata = {
  resource: "assignments",
  label: "Assignments",
  fields: [
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "due_date", label: "Due Date", uiType: "date", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "max_score", label: "Max Score", uiType: "number", required: true },
    { name: "status_id", label: "Status Id", uiType: "number", required: true },
    { name: "subject_id", label: "Subject Id", uiType: "relation", relation: "subjects", required: true },
    { name: "teacher_comments", label: "Teacher Comments", uiType: "json", required: true },
    { name: "teacher_id", label: "Teacher Id", uiType: "number", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true },
    { name: "title", label: "Title", uiType: "text", required: true }
  ]
};
