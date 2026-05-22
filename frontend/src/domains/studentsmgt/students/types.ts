// Auto-generated types for Students domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Students = {
  [K in keyof DB["students"]]: Unwrap<DB["students"][K]>;
};

export type CreateStudents = Omit<Students, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateStudents = Partial<CreateStudents>;

export type StudentsPayload = {
  "admission_date": Students["admissionDate"];
  "admission_no": Students["admissionNo"];
  "admission_status_id": Students["admissionStatusId"];
  "application_date": Students["applicationDate"];
  "date_of_birth": Students["dateOfBirth"];
  "first_name": Students["firstName"];
  "gender": Students["gender"];
  "guardian_contact": Students["guardianContact"];
  "guardian_name": Students["guardianName"];
  "is_active": Students["isActive"];
  "last_name": Students["lastName"];
  "previous_school": Students["previousSchool"];
};

export type StudentsInitialValues = StudentsPayload;
export type StudentsDefaultValues = Partial<StudentsPayload>;
export type StudentsFormValues = StudentsPayload;

export const StudentsMetadata = {
  resource: "students",
  label: "Students",
  fields: [
    { name: "admission_date", label: "Admission Date", uiType: "date", required: true },
    { name: "admission_no", label: "Admission No", uiType: "text", required: true },
    { name: "admission_status_id", label: "Admission Status Id", uiType: "number", required: true },
    { name: "application_date", label: "Application Date", uiType: "date", required: true },
    { name: "date_of_birth", label: "Date Of Birth", uiType: "date", required: true },
    { name: "first_name", label: "First Name", uiType: "text", required: true },
    { name: "gender", label: "Gender", uiType: "text", required: true },
    { name: "guardian_contact", label: "Guardian Contact", uiType: "text", required: true },
    { name: "guardian_name", label: "Guardian Name", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "last_name", label: "Last Name", uiType: "text", required: true },
    { name: "previous_school", label: "Previous School", uiType: "text", required: true }
  ]
};
