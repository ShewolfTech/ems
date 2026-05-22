// Auto-generated types for AcademicsAssignmentSubmissionsView domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AcademicsAssignmentSubmissionsView = {
  [K in keyof DB["academicsAssignmentSubmissionsView"]]: Unwrap<DB["academicsAssignmentSubmissionsView"][K]>;
};

export type CreateAcademicsAssignmentSubmissionsView = Omit<AcademicsAssignmentSubmissionsView, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAcademicsAssignmentSubmissionsView = Partial<CreateAcademicsAssignmentSubmissionsView>;

export type AcademicsAssignmentSubmissionsViewPayload = {
  "assignment_id": AcademicsAssignmentSubmissionsView["assignmentId"];
  "assignment_title": AcademicsAssignmentSubmissionsView["assignmentTitle"];
  "class_id": AcademicsAssignmentSubmissionsView["classId"];
  "class_name": AcademicsAssignmentSubmissionsView["className"];
  "due_date": AcademicsAssignmentSubmissionsView["dueDate"];
  "graded_by": AcademicsAssignmentSubmissionsView["gradedBy"];
  "graded_on": AcademicsAssignmentSubmissionsView["gradedOn"];
  "grade_letter": AcademicsAssignmentSubmissionsView["gradeLetter"];
  "grade_point": AcademicsAssignmentSubmissionsView["gradePoint"];
  "remarks": AcademicsAssignmentSubmissionsView["remarks"];
  "score": AcademicsAssignmentSubmissionsView["score"];
  "student_id": AcademicsAssignmentSubmissionsView["studentId"];
  "student_name": AcademicsAssignmentSubmissionsView["studentName"];
  "subject_id": AcademicsAssignmentSubmissionsView["subjectId"];
  "subject_name": AcademicsAssignmentSubmissionsView["subjectName"];
  "submission_date": AcademicsAssignmentSubmissionsView["submissionDate"];
  "submission_status": AcademicsAssignmentSubmissionsView["submissionStatus"];
  "teacher_comment": AcademicsAssignmentSubmissionsView["teacherComment"];
  "term_id": AcademicsAssignmentSubmissionsView["termId"];
  "term_name": AcademicsAssignmentSubmissionsView["termName"];
};

export type AcademicsAssignmentSubmissionsViewInitialValues = AcademicsAssignmentSubmissionsViewPayload;
export type AcademicsAssignmentSubmissionsViewDefaultValues = Partial<AcademicsAssignmentSubmissionsViewPayload>;
export type AcademicsAssignmentSubmissionsViewFormValues = AcademicsAssignmentSubmissionsViewPayload;

export const AcademicsAssignmentSubmissionsViewMetadata = {
  resource: "academicsAssignmentSubmissionsView",
  label: "Academics Assignment Submissions View",
  fields: [
    { name: "assignment_id", label: "Assignment Id", uiType: "relation", relation: "assignments", required: true },
    { name: "assignment_title", label: "Assignment Title", uiType: "text", required: true },
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "class_name", label: "Class Name", uiType: "text", required: true },
    { name: "due_date", label: "Due Date", uiType: "date", required: true },
    { name: "graded_by", label: "Graded By", uiType: "text", required: true },
    { name: "graded_on", label: "Graded On", uiType: "date", required: true },
    { name: "grade_letter", label: "Grade Letter", uiType: "text", required: true },
    { name: "grade_point", label: "Grade Point", uiType: "number", required: true },
    { name: "remarks", label: "Remarks", uiType: "text", required: true },
    { name: "score", label: "Score", uiType: "number", required: true },
    { name: "student_id", label: "Student Id", uiType: "relation", relation: "students", required: true },
    { name: "student_name", label: "Student Name", uiType: "text", required: true },
    { name: "subject_id", label: "Subject Id", uiType: "relation", relation: "subjects", required: true },
    { name: "subject_name", label: "Subject Name", uiType: "text", required: true },
    { name: "submission_date", label: "Submission Date", uiType: "date", required: true },
    { name: "submission_status", label: "Submission Status", uiType: "text", required: true },
    { name: "teacher_comment", label: "Teacher Comment", uiType: "text", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true },
    { name: "term_name", label: "Term Name", uiType: "text", required: true }
  ]
};
