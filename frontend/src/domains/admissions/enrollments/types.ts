// Enrollments domain types

export interface Enrollments {
  id: number;
  school_id: number;
  application_id: number;
  student_id: number | null;
  enrollment_date: Date;
  academic_year: string;
  grade_id: number | null;
  stream_id: number | null;
  enrollment_status: string;
  fees_category: string | null;
  documents_submitted: any;
  fees_paid: boolean;
  fees_amount: number | null;
  fees_receipt_no: string | null;
  created_at: Date;
  created_by: number | null;
  updated_at: Date;
  updated_by: number | null;
  completed_at: Date | null;
  completed_by: number | null;
}

export type CreateEnrollments = Omit<Enrollments, "id" | "created_at" | "updated_at">;
export type UpdateEnrollments = Partial<CreateEnrollments>;

export const EnrollmentsMetadata = {
  resource: "enrollments",
  label: "Enrollments",
  fields: [
    { name: "application_id", label: "Application ID", uiType: "number", required: true },
    { name: "enrollment_date", label: "Enrollment Date", uiType: "date", required: true },
    { name: "academic_year", label: "Academic Year", uiType: "text", required: true },
    { name: "grade_id", label: "Grade ID", uiType: "number", required: false },
    { name: "stream_id", label: "Stream ID", uiType: "number", required: false },
    { name: "fees_category", label: "Fees Category", uiType: "text", required: false },
  ]
};
