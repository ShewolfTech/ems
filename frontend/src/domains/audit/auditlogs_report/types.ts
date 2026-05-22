// Auto-generated types for AuditlogsReport domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type AuditlogsReport = {
  [K in keyof DB["auditlogsReport"]]: Unwrap<DB["auditlogsReport"][K]>;
};

export type CreateAuditlogsReport = Omit<AuditlogsReport, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateAuditlogsReport = Partial<CreateAuditlogsReport>;

export type AuditlogsReportPayload = {
  "action": AuditlogsReport["action"];
  "new_value": AuditlogsReport["newValue"];
  "old_value": AuditlogsReport["oldValue"];
  "resource_id": AuditlogsReport["resourceId"];
  "resource_type": AuditlogsReport["resourceType"];
  "school_scope": AuditlogsReport["schoolScope"];
};

export type AuditlogsReportInitialValues = AuditlogsReportPayload;
export type AuditlogsReportDefaultValues = Partial<AuditlogsReportPayload>;
export type AuditlogsReportFormValues = AuditlogsReportPayload;

export const AuditlogsReportMetadata = {
  resource: "auditlogsReport",
  label: "Auditlogs Report",
  fields: [
    { name: "action", label: "Action", uiType: "text", required: true },
    { name: "new_value", label: "New Value", uiType: "json", required: true },
    { name: "old_value", label: "Old Value", uiType: "json", required: true },
    { name: "resource_id", label: "Resource Id", uiType: "number", required: true },
    { name: "resource_type", label: "Resource Type", uiType: "text", required: true },
    { name: "school_scope", label: "School Scope", uiType: "text", required: true }
  ]
};
