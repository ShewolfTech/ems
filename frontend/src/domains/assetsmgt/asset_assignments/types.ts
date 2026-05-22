// Auto-generated types for AssetAssignments domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AssetAssignments = {
  [K in keyof DB["assetAssignments"]]: Unwrap<DB["assetAssignments"][K]>;
};

export type CreateAssetAssignments = Omit<AssetAssignments, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAssetAssignments = Partial<CreateAssetAssignments>;

export type AssetAssignmentsPayload = {
  "asset_id": AssetAssignments["assetId"];
  "assigned_at": AssetAssignments["assignedAt"];
  "assigned_by": AssetAssignments["assignedBy"];
  "assignment_type": AssetAssignments["assignmentType"];
  "notes": AssetAssignments["notes"];
  "unassigned_at": AssetAssignments["unassignedAt"];
};

export type AssetAssignmentsInitialValues = AssetAssignmentsPayload;
export type AssetAssignmentsDefaultValues = Partial<AssetAssignmentsPayload>;
export type AssetAssignmentsFormValues = AssetAssignmentsPayload;

export const AssetAssignmentsMetadata = {
  resource: "assetAssignments",
  label: "Asset Assignments",
  fields: [
    { name: "asset_id", label: "Asset Id", uiType: "relation", relation: "assets", required: true },
    { name: "assigned_at", label: "Assigned At", uiType: "date", required: true },
    { name: "assigned_by", label: "Assigned By", uiType: "number", required: true },
    { name: "assignment_type", label: "Assignment Type", uiType: "text", required: true },
    { name: "notes", label: "Notes", uiType: "text", required: true },
    { name: "unassigned_at", label: "Unassigned At", uiType: "date", required: true }
  ]
};
