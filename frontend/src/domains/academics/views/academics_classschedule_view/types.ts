// Auto-generated types for AcademicsClassscheduleView domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AcademicsClassscheduleView = {
  [K in keyof DB["academicsClassscheduleView"]]: Unwrap<DB["academicsClassscheduleView"][K]>;
};

export type CreateAcademicsClassscheduleView = Omit<AcademicsClassscheduleView, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAcademicsClassscheduleView = Partial<CreateAcademicsClassscheduleView>;

export type AcademicsClassscheduleViewPayload = {
  "class_id": AcademicsClassscheduleView["classId"];
  "class_name": AcademicsClassscheduleView["className"];
  "end_time": AcademicsClassscheduleView["endTime"];
  "lesson_id": AcademicsClassscheduleView["lessonId"];
  "lesson_status": AcademicsClassscheduleView["lessonStatus"];
  "lesson_title": AcademicsClassscheduleView["lessonTitle"];
  "scheduled_date": AcademicsClassscheduleView["scheduledDate"];
  "start_time": AcademicsClassscheduleView["startTime"];
  "subject_name": AcademicsClassscheduleView["subjectName"];
  "teacher_comment": AcademicsClassscheduleView["teacherComment"];
  "teacher_name": AcademicsClassscheduleView["teacherName"];
  "term_id": AcademicsClassscheduleView["termId"];
  "term_name": AcademicsClassscheduleView["termName"];
  "timetable_id": AcademicsClassscheduleView["timetableId"];
  "timetable_name": AcademicsClassscheduleView["timetableName"];
};

export type AcademicsClassscheduleViewInitialValues = AcademicsClassscheduleViewPayload;
export type AcademicsClassscheduleViewDefaultValues = Partial<AcademicsClassscheduleViewPayload>;
export type AcademicsClassscheduleViewFormValues = AcademicsClassscheduleViewPayload;

export const AcademicsClassscheduleViewMetadata = {
  resource: "academicsClassscheduleView",
  label: "Academics Classschedule View",
  fields: [
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "class_name", label: "Class Name", uiType: "text", required: true },
    { name: "end_time", label: "End Time", uiType: "text", required: true },
    { name: "lesson_id", label: "Lesson Id", uiType: "relation", relation: "lessons", required: true },
    { name: "lesson_status", label: "Lesson Status", uiType: "text", required: true },
    { name: "lesson_title", label: "Lesson Title", uiType: "text", required: true },
    { name: "scheduled_date", label: "Scheduled Date", uiType: "date", required: true },
    { name: "start_time", label: "Start Time", uiType: "text", required: true },
    { name: "subject_name", label: "Subject Name", uiType: "text", required: true },
    { name: "teacher_comment", label: "Teacher Comment", uiType: "text", required: true },
    { name: "teacher_name", label: "Teacher Name", uiType: "text", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true },
    { name: "term_name", label: "Term Name", uiType: "text", required: true },
    { name: "timetable_id", label: "Timetable Id", uiType: "relation", relation: "timetables", required: true },
    { name: "timetable_name", label: "Timetable Name", uiType: "text", required: true }
  ]
};
