// Auto-generated types for AssetTypes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AssetTypes = {
  [K in keyof DB["assetTypes"]]: Unwrap<DB["assetTypes"][K]>;
};

export type CreateAssetTypes = Omit<AssetTypes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAssetTypes = Partial<CreateAssetTypes>;

export type AssetTypesPayload = {
  "category": AssetTypes["category"];
  "code": AssetTypes["code"];
  "is_active": AssetTypes["isActive"];
  "is_biometric": AssetTypes["isBiometric"];
  "name": AssetTypes["name"];
  "purpose": AssetTypes["purpose"];
  "requires_calibration": AssetTypes["requiresCalibration"];
  "subcategory": AssetTypes["subcategory"];
  "vendor_requirements": AssetTypes["vendorRequirements"];
};

export type AssetTypesInitialValues = AssetTypesPayload;
export type AssetTypesDefaultValues = Partial<AssetTypesPayload>;
export type AssetTypesFormValues = AssetTypesPayload;

export const AssetTypesMetadata = {
  resource: "assetTypes",
  label: "Asset Types",
  fields: [
    { name: "category", label: "Category", uiType: "text", required: true },
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_biometric", label: "Is Biometric", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "purpose", label: "Purpose", uiType: "multiselect", required: true },
    { name: "requires_calibration", label: "Requires Calibration", uiType: "boolean", required: true },
    { name: "subcategory", label: "Subcategory", uiType: "text", required: true },
    { name: "vendor_requirements", label: "Vendor Requirements", uiType: "json", required: true }
  ]
};
