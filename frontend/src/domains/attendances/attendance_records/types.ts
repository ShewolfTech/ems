// Auto-generated types for AttendanceRecords domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AttendanceRecords = {
  [K in keyof DB["attendanceRecords"]]: Unwrap<DB["attendanceRecords"][K]>;
};

export type CreateAttendanceRecords = Omit<AttendanceRecords, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAttendanceRecords = Partial<CreateAttendanceRecords>;

export type AttendanceRecordsPayload = {
  "asset_id": AttendanceRecords["assetId"];
  "biometric_match_confidence": AttendanceRecords["biometricMatchConfidence"];
  "biometric_scan_quality": AttendanceRecords["biometricScanQuality"];
  "biometric_template_hash": AttendanceRecords["biometricTemplateHash"];
  "device_code": AttendanceRecords["deviceCode"];
  "is_verified": AttendanceRecords["isVerified"];
  "location_lat": AttendanceRecords["locationLat"];
  "location_lng": AttendanceRecords["locationLng"];
  "method": AttendanceRecords["method"];
  "recorded_at": AttendanceRecords["recordedAt"];
  "recorded_by": AttendanceRecords["recordedBy"];
  "remark": AttendanceRecords["remark"];
  "session_id": AttendanceRecords["sessionId"];
  "sign_type": AttendanceRecords["signType"];
  "status": AttendanceRecords["status"];
  "verified_at": AttendanceRecords["verifiedAt"];
  "verified_by": AttendanceRecords["verifiedBy"];
};

export type AttendanceRecordsInitialValues = AttendanceRecordsPayload;
export type AttendanceRecordsDefaultValues = Partial<AttendanceRecordsPayload>;
export type AttendanceRecordsFormValues = AttendanceRecordsPayload;

export const AttendanceRecordsMetadata = {
  resource: "attendanceRecords",
  label: "Attendance Records",
  fields: [
    { name: "asset_id", label: "Asset Id", uiType: "relation", relation: "assets", required: true },
    { name: "biometric_match_confidence", label: "Biometric Match Confidence", uiType: "number", required: true },
    { name: "biometric_scan_quality", label: "Biometric Scan Quality", uiType: "text", required: true },
    { name: "biometric_template_hash", label: "Biometric Template Hash", uiType: "text", required: true },
    { name: "device_code", label: "Device Code", uiType: "text", required: true },
    { name: "is_verified", label: "Is Verified", uiType: "boolean", required: true },
    { name: "location_lat", label: "Location Lat", uiType: "number", required: true },
    { name: "location_lng", label: "Location Lng", uiType: "number", required: true },
    { name: "method", label: "Method", uiType: "text", required: true },
    { name: "recorded_at", label: "Recorded At", uiType: "date", required: true },
    { name: "recorded_by", label: "Recorded By", uiType: "number", required: true },
    { name: "remark", label: "Remark", uiType: "text", required: true },
    { name: "session_id", label: "Session Id", uiType: "number", required: true },
    { name: "sign_type", label: "Sign Type", uiType: "text", required: true },
    { name: "status", label: "Status", uiType: "text", required: true },
    { name: "verified_at", label: "Verified At", uiType: "date", required: true },
    { name: "verified_by", label: "Verified By", uiType: "number", required: true }
  ]
};
