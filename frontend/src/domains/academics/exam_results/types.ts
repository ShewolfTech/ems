// Auto-generated types for ExamResults domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type ExamResults = {
  [K in keyof DB["examResults"]]: Unwrap<DB["examResults"][K]>;
};

export type CreateExamResults = Omit<ExamResults, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateExamResults = Partial<CreateExamResults>;

export type ExamResultsPayload = {
  "exam_id": ExamResults["examId"];
  "graded_by": ExamResults["gradedBy"];
  "grade_letter": ExamResults["gradeLetter"];
  "grade_point": ExamResults["gradePoint"];
  "is_active": ExamResults["isActive"];
  "is_final": ExamResults["isFinal"];
  "remarks": ExamResults["remarks"];
  "score": ExamResults["score"];
  "status_id": ExamResults["statusId"];
  "student_id": ExamResults["studentId"];
  "teacher_comments": ExamResults["teacherComments"];
};

export type ExamResultsInitialValues = ExamResultsPayload;
export type ExamResultsDefaultValues = Partial<ExamResultsPayload>;
export type ExamResultsFormValues = ExamResultsPayload;

export const ExamResultsMetadata = {
  resource: "examResults",
  label: "Exam Results",
  fields: [
    { name: "exam_id", label: "Exam Id", uiType: "relation", relation: "exams", required: true },
    { name: "graded_by", label: "Graded By", uiType: "number", required: true },
    { name: "grade_letter", label: "Grade Letter", uiType: "text", required: true },
    { name: "grade_point", label: "Grade Point", uiType: "number", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_final", label: "Is Final", uiType: "boolean", required: true },
    { name: "remarks", label: "Remarks", uiType: "text", required: true },
    { name: "score", label: "Score", uiType: "number", required: true },
    { name: "status_id", label: "Status Id", uiType: "number", required: true },
    { name: "student_id", label: "Student Id", uiType: "relation", relation: "students", required: true },
    { name: "teacher_comments", label: "Teacher Comments", uiType: "json", required: true }
  ]
};
