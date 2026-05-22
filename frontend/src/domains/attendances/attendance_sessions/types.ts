// Auto-generated types for AttendanceSessions domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AttendanceSessions = {
  [K in keyof DB["attendanceSessions"]]: Unwrap<DB["attendanceSessions"][K]>;
};

export type CreateAttendanceSessions = Omit<AttendanceSessions, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAttendanceSessions = Partial<CreateAttendanceSessions>;

export type AttendanceSessionsPayload = {
  "class_id": AttendanceSessions["classId"];
  "date": AttendanceSessions["date"];
  "end_time": AttendanceSessions["endTime"];
  "meeting_agenda": AttendanceSessions["meetingAgenda"];
  "meeting_title": AttendanceSessions["meetingTitle"];
  "meeting_type": AttendanceSessions["meetingType"];
  "room_id": AttendanceSessions["roomId"];
  "session_type": AttendanceSessions["sessionType"];
  "start_time": AttendanceSessions["startTime"];
  "status": AttendanceSessions["status"];
  "subject_id": AttendanceSessions["subjectId"];
  "teacher_id": AttendanceSessions["teacherId"];
  "term_id": AttendanceSessions["termId"];
};

export type AttendanceSessionsInitialValues = AttendanceSessionsPayload;
export type AttendanceSessionsDefaultValues = Partial<AttendanceSessionsPayload>;
export type AttendanceSessionsFormValues = AttendanceSessionsPayload;

export const AttendanceSessionsMetadata = {
  resource: "attendanceSessions",
  label: "Attendance Sessions",
  fields: [
    { name: "class_id", label: "Class Id", uiType: "number", required: true },
    { name: "date", label: "Date", uiType: "date", required: true },
    { name: "end_time", label: "End Time", uiType: "text", required: true },
    { name: "meeting_agenda", label: "Meeting Agenda", uiType: "text", required: true },
    { name: "meeting_title", label: "Meeting Title", uiType: "text", required: true },
    { name: "meeting_type", label: "Meeting Type", uiType: "text", required: true },
    { name: "room_id", label: "Room Id", uiType: "number", required: true },
    { name: "session_type", label: "Session Type", uiType: "text", required: true },
    { name: "start_time", label: "Start Time", uiType: "text", required: true },
    { name: "status", label: "Status", uiType: "text", required: true },
    { name: "subject_id", label: "Subject Id", uiType: "relation", relation: "subjects", required: true },
    { name: "teacher_id", label: "Teacher Id", uiType: "number", required: true },
    { name: "term_id", label: "Term Id", uiType: "relation", relation: "terms", required: true }
  ]
};
