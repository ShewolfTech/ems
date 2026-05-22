// Auto-generated types for AuditrouteReport domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AuditrouteReport = {
  [K in keyof DB["auditrouteReport"]]: Unwrap<DB["auditrouteReport"][K]>;
};

export type CreateAuditrouteReport = Omit<AuditrouteReport, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAuditrouteReport = Partial<CreateAuditrouteReport>;

export type AuditrouteReportPayload = {
  "action": AuditrouteReport["action"];
  "audit_id": AuditrouteReport["auditId"];
  "diff": AuditrouteReport["diff"];
  "method": AuditrouteReport["method"];
  "permission_resource": AuditrouteReport["permissionResource"];
  "resource_id": AuditrouteReport["resourceId"];
  "resource_type": AuditrouteReport["resourceType"];
  "role_id": AuditrouteReport["roleId"];
  "route": AuditrouteReport["route"];
};

export type AuditrouteReportInitialValues = AuditrouteReportPayload;
export type AuditrouteReportDefaultValues = Partial<AuditrouteReportPayload>;
export type AuditrouteReportFormValues = AuditrouteReportPayload;

export const AuditrouteReportMetadata = {
  resource: "auditrouteReport",
  label: "Auditroute Report",
  fields: [
    { name: "action", label: "Action", uiType: "text", required: true },
    { name: "audit_id", label: "Audit Id", uiType: "number", required: true },
    { name: "diff", label: "Diff", uiType: "json", required: true },
    { name: "method", label: "Method", uiType: "text", required: true },
    { name: "permission_resource", label: "Permission Resource", uiType: "text", required: true },
    { name: "resource_id", label: "Resource Id", uiType: "number", required: true },
    { name: "resource_type", label: "Resource Type", uiType: "text", required: true },
    { name: "role_id", label: "Role Id", uiType: "relation", relation: "roles", required: true },
    { name: "route", label: "Route", uiType: "text", required: true }
  ]
};
