// Auto-generated types for Assets domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Assets = {
  [K in keyof DB["assets"]]: Unwrap<DB["assets"][K]>;
};

export type CreateAssets = Omit<Assets, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAssets = Partial<CreateAssets>;

export type AssetsPayload = {
  "asset_code": Assets["assetCode"];
  "asset_type_id": Assets["assetTypeId"];
  "description": Assets["description"];
  "is_active": Assets["isActive"];
  "location": Assets["location"];
  "name": Assets["name"];
  "nfc_tag": Assets["nfcTag"];
  "purchase_date": Assets["purchaseDate"];
  "qr_code": Assets["qrCode"];
  "serial_number": Assets["serialNumber"];
  "status": Assets["status"];
  "vendor": Assets["vendor"];
  "warranty_expiry": Assets["warrantyExpiry"];
};

export type AssetsInitialValues = AssetsPayload;
export type AssetsDefaultValues = Partial<AssetsPayload>;
export type AssetsFormValues = AssetsPayload;

export const AssetsMetadata = {
  resource: "assets",
  label: "Assets",
  fields: [
    { name: "asset_code", label: "Asset Code", uiType: "text", required: true },
    { name: "asset_type_id", label: "Asset Type Id", uiType: "number", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "location", label: "Location", uiType: "text", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "nfc_tag", label: "Nfc Tag", uiType: "text", required: true },
    { name: "purchase_date", label: "Purchase Date", uiType: "date", required: true },
    { name: "qr_code", label: "Qr Code", uiType: "text", required: true },
    { name: "serial_number", label: "Serial Number", uiType: "text", required: true },
    { name: "status", label: "Status", uiType: "text", required: true },
    { name: "vendor", label: "Vendor", uiType: "text", required: true },
    { name: "warranty_expiry", label: "Warranty Expiry", uiType: "date", required: true }
  ]
};
