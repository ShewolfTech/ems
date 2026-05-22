// Auto-generated types for CampusAccessLogs domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type CampusAccessLogs = {
  [K in keyof DB["campusAccessLogs"]]: Unwrap<DB["campusAccessLogs"][K]>;
};

export type CreateCampusAccessLogs = Omit<CampusAccessLogs, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateCampusAccessLogs = Partial<CreateCampusAccessLogs>;

export type CampusAccessLogsPayload = {
  "asset_id": CampusAccessLogs["assetId"];
  "biometric_match_confidence": CampusAccessLogs["biometricMatchConfidence"];
  "biometric_scan_quality": CampusAccessLogs["biometricScanQuality"];
  "biometric_template_hash": CampusAccessLogs["biometricTemplateHash"];
  "device_code": CampusAccessLogs["deviceCode"];
  "event_at": CampusAccessLogs["eventAt"];
  "event_type": CampusAccessLogs["eventType"];
  "is_verified": CampusAccessLogs["isVerified"];
  "location_lat": CampusAccessLogs["locationLat"];
  "location_lng": CampusAccessLogs["locationLng"];
  "location_name": CampusAccessLogs["locationName"];
  "method": CampusAccessLogs["method"];
  "recorded_at": CampusAccessLogs["recordedAt"];
  "verified_at": CampusAccessLogs["verifiedAt"];
  "verified_by": CampusAccessLogs["verifiedBy"];
};

export type CampusAccessLogsInitialValues = CampusAccessLogsPayload;
export type CampusAccessLogsDefaultValues = Partial<CampusAccessLogsPayload>;
export type CampusAccessLogsFormValues = CampusAccessLogsPayload;

export const CampusAccessLogsMetadata = {
  resource: "campusAccessLogs",
  label: "Campus Access Logs",
  fields: [
    { name: "asset_id", label: "Asset Id", uiType: "relation", relation: "assets", required: true },
    { name: "biometric_match_confidence", label: "Biometric Match Confidence", uiType: "number", required: true },
    { name: "biometric_scan_quality", label: "Biometric Scan Quality", uiType: "text", required: true },
    { name: "biometric_template_hash", label: "Biometric Template Hash", uiType: "text", required: true },
    { name: "device_code", label: "Device Code", uiType: "text", required: true },
    { name: "event_at", label: "Event At", uiType: "date", required: true },
    { name: "event_type", label: "Event Type", uiType: "text", required: true },
    { name: "is_verified", label: "Is Verified", uiType: "boolean", required: true },
    { name: "location_lat", label: "Location Lat", uiType: "number", required: true },
    { name: "location_lng", label: "Location Lng", uiType: "number", required: true },
    { name: "location_name", label: "Location Name", uiType: "text", required: true },
    { name: "method", label: "Method", uiType: "text", required: true },
    { name: "recorded_at", label: "Recorded At", uiType: "date", required: true },
    { name: "verified_at", label: "Verified At", uiType: "date", required: true },
    { name: "verified_by", label: "Verified By", uiType: "number", required: true }
  ]
};
