// Auto-generated types for AttendancePolicies domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AttendancePolicies = {
  [K in keyof DB["attendancePolicies"]]: Unwrap<DB["attendancePolicies"][K]>;
};

export type CreateAttendancePolicies = Omit<AttendancePolicies, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAttendancePolicies = Partial<CreateAttendancePolicies>;

export type AttendancePoliciesPayload = {
  "absent_after_late_threshold": AttendancePolicies["absentAfterLateThreshold"];
  "auto_excuse_rules": AttendancePolicies["autoExcuseRules"];
  "consecutive_absence_alert": AttendancePolicies["consecutiveAbsenceAlert"];
  "late_threshold_minutes": AttendancePolicies["lateThresholdMinutes"];
  "min_sessions_per_day": AttendancePolicies["minSessionsPerDay"];
  "moes_min_attendance_percent": AttendancePolicies["moesMinAttendancePercent"];
  "name": AttendancePolicies["name"];
  "sms_provider": AttendancePolicies["smsProvider"];
  "truant_definition": AttendancePolicies["truantDefinition"];
};

export type AttendancePoliciesInitialValues = AttendancePoliciesPayload;
export type AttendancePoliciesDefaultValues = Partial<AttendancePoliciesPayload>;
export type AttendancePoliciesFormValues = AttendancePoliciesPayload;

export const AttendancePoliciesMetadata = {
  resource: "attendancePolicies",
  label: "Attendance Policies",
  fields: [
    { name: "absent_after_late_threshold", label: "Absent After Late Threshold", uiType: "number", required: true },
    { name: "auto_excuse_rules", label: "Auto Excuse Rules", uiType: "json", required: true },
    { name: "consecutive_absence_alert", label: "Consecutive Absence Alert", uiType: "number", required: true },
    { name: "late_threshold_minutes", label: "Late Threshold Minutes", uiType: "number", required: true },
    { name: "min_sessions_per_day", label: "Min Sessions Per Day", uiType: "number", required: true },
    { name: "moes_min_attendance_percent", label: "Moes Min Attendance Percent", uiType: "number", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "sms_provider", label: "Sms Provider", uiType: "text", required: true },
    { name: "truant_definition", label: "Truant Definition", uiType: "json", required: true }
  ]
};
