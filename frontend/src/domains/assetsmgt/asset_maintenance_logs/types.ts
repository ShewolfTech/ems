// Auto-generated types for AssetMaintenanceLogs domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AssetMaintenanceLogs = {
  [K in keyof DB["assetMaintenanceLogs"]]: Unwrap<DB["assetMaintenanceLogs"][K]>;
};

export type CreateAssetMaintenanceLogs = Omit<AssetMaintenanceLogs, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAssetMaintenanceLogs = Partial<CreateAssetMaintenanceLogs>;

export type AssetMaintenanceLogsPayload = {
  "asset_id": AssetMaintenanceLogs["assetId"];
  "details": AssetMaintenanceLogs["details"];
  "logged_at": AssetMaintenanceLogs["loggedAt"];
  "log_type": AssetMaintenanceLogs["logType"];
  "resolution_notes": AssetMaintenanceLogs["resolutionNotes"];
  "resolved_at": AssetMaintenanceLogs["resolvedAt"];
  "technician_id": AssetMaintenanceLogs["technicianId"];
};

export type AssetMaintenanceLogsInitialValues = AssetMaintenanceLogsPayload;
export type AssetMaintenanceLogsDefaultValues = Partial<AssetMaintenanceLogsPayload>;
export type AssetMaintenanceLogsFormValues = AssetMaintenanceLogsPayload;

export const AssetMaintenanceLogsMetadata = {
  resource: "assetMaintenanceLogs",
  label: "Asset Maintenance Logs",
  fields: [
    { name: "asset_id", label: "Asset Id", uiType: "relation", relation: "assets", required: true },
    { name: "details", label: "Details", uiType: "json", required: true },
    { name: "logged_at", label: "Logged At", uiType: "date", required: true },
    { name: "log_type", label: "Log Type", uiType: "text", required: true },
    { name: "resolution_notes", label: "Resolution Notes", uiType: "text", required: true },
    { name: "resolved_at", label: "Resolved At", uiType: "date", required: true },
    { name: "technician_id", label: "Technician Id", uiType: "number", required: true }
  ]
};
