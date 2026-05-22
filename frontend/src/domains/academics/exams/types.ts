// Auto-generated types for Exams domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Exams = {
  [K in keyof DB["exams"]]: Unwrap<DB["exams"][K]>;
};

export type CreateExams = Omit<Exams, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateExams = Partial<CreateExams>;

export type ExamsPayload = {
  "class_id": Exams["classId"];
  "description": Exams["description"];
  "end_time": Exams["endTime"];
  "exam_date": Exams["examDate"];
  "is_active": Exams["isActive"];
  "max_score": Exams["maxScore"];
  "start_time": Exams["startTime"];
  "status_id": Exams["statusId"];
  "subject_id": Exams["subjectId"];
  "teacher_comments": Exams["teacherComments"];
  "teacher_id": Exams["teacherId"];
  "term_id": Exams["termId"];
  "title": Exams["title"];
};

export type ExamsInitialValues = ExamsPayload;
export type ExamsDefaultValues = Partial<ExamsPayload>;
export type ExamsFormValues = ExamsPayload;

export const ExamsMetadata = {
  resource: "exams",
  label: "Exams",
  fields: [
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "end_time", label: "End Time", uiType: "text", required: true },
    { name: "exam_date", label: "Exam Date", uiType: "date", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "max_score", label: "Max Score", uiType: "number", required: true },
    { name: "start_time", label: "Start Time", uiType: "text", required: true },
    { name: "status_id", label: "Status Id", uiType: "number", required: true },
    { name: "subject_id", label: "Subject Id", uiType: "relation", relation: "subjects", required: true },
    { name: "teacher_comments", label: "Teacher Comments", uiType: "json", required: true },
    { name: "teacher_id", label: "Teacher Id", uiType: "number", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true },
    { name: "title", label: "Title", uiType: "text", required: true }
  ]
};
