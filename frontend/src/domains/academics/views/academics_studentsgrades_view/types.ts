// Auto-generated types for AcademicsStudentsgradesView domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AcademicsStudentsgradesView = {
  [K in keyof DB["academicsStudentsgradesView"]]: Unwrap<DB["academicsStudentsgradesView"][K]>;
};

export type CreateAcademicsStudentsgradesView = Omit<AcademicsStudentsgradesView, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAcademicsStudentsgradesView = Partial<CreateAcademicsStudentsgradesView>;

export type AcademicsStudentsgradesViewPayload = {
  "academic_year": AcademicsStudentsgradesView["academicYear"];
  "assessment_date": AcademicsStudentsgradesView["assessmentDate"];
  "assessment_id": AcademicsStudentsgradesView["assessmentId"];
  "assessment_status": AcademicsStudentsgradesView["assessmentStatus"];
  "assessment_title": AcademicsStudentsgradesView["assessmentTitle"];
  "assessment_type": AcademicsStudentsgradesView["assessmentType"];
  "class_name": AcademicsStudentsgradesView["className"];
  "grade_letter": AcademicsStudentsgradesView["gradeLetter"];
  "grade_level": AcademicsStudentsgradesView["gradeLevel"];
  "grade_point": AcademicsStudentsgradesView["gradePoint"];
  "max_score": AcademicsStudentsgradesView["maxScore"];
  "remarks": AcademicsStudentsgradesView["remarks"];
  "score": AcademicsStudentsgradesView["score"];
  "student_id": AcademicsStudentsgradesView["studentId"];
  "student_name": AcademicsStudentsgradesView["studentName"];
  "subject_name": AcademicsStudentsgradesView["subjectName"];
  "teacher_comment": AcademicsStudentsgradesView["teacherComment"];
  "teacher_name": AcademicsStudentsgradesView["teacherName"];
  "term_name": AcademicsStudentsgradesView["termName"];
};

export type AcademicsStudentsgradesViewInitialValues = AcademicsStudentsgradesViewPayload;
export type AcademicsStudentsgradesViewDefaultValues = Partial<AcademicsStudentsgradesViewPayload>;
export type AcademicsStudentsgradesViewFormValues = AcademicsStudentsgradesViewPayload;

export const AcademicsStudentsgradesViewMetadata = {
  resource: "academicsStudentsgradesView",
  label: "Academics Studentsgrades View",
  fields: [
    { name: "academic_year", label: "Academic Year", uiType: "text", required: true },
    { name: "assessment_date", label: "Assessment Date", uiType: "date", required: true },
    { name: "assessment_id", label: "Assessment Id", uiType: "relation", relation: "assessments", required: true },
    { name: "assessment_status", label: "Assessment Status", uiType: "text", required: true },
    { name: "assessment_title", label: "Assessment Title", uiType: "text", required: true },
    { name: "assessment_type", label: "Assessment Type", uiType: "text", required: true },
    { name: "class_name", label: "Class Name", uiType: "text", required: true },
    { name: "grade_letter", label: "Grade Letter", uiType: "text", required: true },
    { name: "grade_level", label: "Grade Level", uiType: "text", required: true },
    { name: "grade_point", label: "Grade Point", uiType: "number", required: true },
    { name: "max_score", label: "Max Score", uiType: "number", required: true },
    { name: "remarks", label: "Remarks", uiType: "text", required: true },
    { name: "score", label: "Score", uiType: "number", required: true },
    { name: "student_id", label: "Student Id", uiType: "relation", relation: "students", required: true },
    { name: "student_name", label: "Student Name", uiType: "text", required: true },
    { name: "subject_name", label: "Subject Name", uiType: "text", required: true },
    { name: "teacher_comment", label: "Teacher Comment", uiType: "text", required: true },
    { name: "teacher_name", label: "Teacher Name", uiType: "text", required: true },
    { name: "term_name", label: "Term Name", uiType: "text", required: true }
  ]
};
