// Auto-generated types for AttendanceStatus domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AttendanceStatus = {
  [K in keyof DB["attendanceStatus"]]: Unwrap<DB["attendanceStatus"][K]>;
};

export type CreateAttendanceStatus = Omit<AttendanceStatus, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAttendanceStatus = Partial<CreateAttendanceStatus>;

export type AttendanceStatusPayload = {
  "is_active": AttendanceStatus["isActive"];
  "name": AttendanceStatus["name"];
};

export type AttendanceStatusInitialValues = AttendanceStatusPayload;
export type AttendanceStatusDefaultValues = Partial<AttendanceStatusPayload>;
export type AttendanceStatusFormValues = AttendanceStatusPayload;

export const AttendanceStatusMetadata = {
  resource: "attendanceStatus",
  label: "Attendance Status",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
