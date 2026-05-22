// Auto-generated types for ReportCards domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type ReportCards = {
  [K in keyof DB["reportCards"]]: Unwrap<DB["reportCards"][K]>;
};

export type CreateReportCards = Omit<ReportCards, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateReportCards = Partial<CreateReportCards>;

export type ReportCardsPayload = {
  "attendance_percentage": ReportCards["attendancePercentage"];
  "class_teacher_id": ReportCards["classTeacherId"];
  "gpa": ReportCards["gpa"];
  "grade_letter": ReportCards["gradeLetter"];
  "is_active": ReportCards["isActive"];
  "percentage": ReportCards["percentage"];
  "status_id": ReportCards["statusId"];
  "student_id": ReportCards["studentId"];
  "teacher_comments": ReportCards["teacherComments"];
  "term_id": ReportCards["termId"];
};

export type ReportCardsInitialValues = ReportCardsPayload;
export type ReportCardsDefaultValues = Partial<ReportCardsPayload>;
export type ReportCardsFormValues = ReportCardsPayload;

export const ReportCardsMetadata = {
  resource: "reportCards",
  label: "Report Cards",
  fields: [
    { name: "attendance_percentage", label: "Attendance Percentage", uiType: "number", required: true },
    { name: "class_teacher_id", label: "Class Teacher Id", uiType: "number", required: true },
    { name: "gpa", label: "Gpa", uiType: "number", required: true },
    { name: "grade_letter", label: "Grade Letter", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "percentage", label: "Percentage", uiType: "number", required: true },
    { name: "status_id", label: "Status Id", uiType: "number", required: true },
    { name: "student_id", label: "Student Id", uiType: "relation", relation: "students", required: true },
    { name: "teacher_comments", label: "Teacher Comments", uiType: "json", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true }
  ]
};
