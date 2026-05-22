// Auto-generated types for Assessments domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Assessments = {
  [K in keyof DB["assessments"]]: Unwrap<DB["assessments"][K]>;
};

export type CreateAssessments = Omit<Assessments, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAssessments = Partial<CreateAssessments>;

export type AssessmentsPayload = {
  "academic_year_id": Assessments["academicYearId"];
  "assessment_type_id": Assessments["assessmentTypeId"];
  "class_id": Assessments["classId"];
  "date": Assessments["date"];
  "description": Assessments["description"];
  "is_active": Assessments["isActive"];
  "max_score": Assessments["maxScore"];
  "status_id": Assessments["statusId"];
  "subject_id": Assessments["subjectId"];
  "teacher_comments": Assessments["teacherComments"];
  "teacher_id": Assessments["teacherId"];
  "term_id": Assessments["termId"];
  "title": Assessments["title"];
  "weight": Assessments["weight"];
};

export type AssessmentsInitialValues = AssessmentsPayload;
export type AssessmentsDefaultValues = Partial<AssessmentsPayload>;
export type AssessmentsFormValues = AssessmentsPayload;

export const AssessmentsMetadata = {
  resource: "assessments",
  label: "Assessments",
  fields: [
    { name: "academic_year_id", label: "Academic Year Id", uiType: "number", required: true },
    { name: "assessment_type_id", label: "Assessment Type Id", uiType: "number", required: true },
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "date", label: "Date", uiType: "date", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "max_score", label: "Max Score", uiType: "number", required: true },
    { name: "status_id", label: "Status Id", uiType: "number", required: true },
    { name: "subject_id", label: "Subject Id", uiType: "relation", relation: "subjects", required: true },
    { name: "teacher_comments", label: "Teacher Comments", uiType: "json", required: true },
    { name: "teacher_id", label: "Teacher Id", uiType: "number", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true },
    { name: "title", label: "Title", uiType: "text", required: true },
    { name: "weight", label: "Weight", uiType: "number", required: true }
  ]
};
