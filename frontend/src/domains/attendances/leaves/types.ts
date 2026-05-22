// Auto-generated types for Leaves domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Leaves = {
  [K in keyof DB["leaves"]]: Unwrap<DB["leaves"][K]>;
};

export type CreateLeaves = Omit<Leaves, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateLeaves = Partial<CreateLeaves>;

export type LeavesPayload = {
  "applied_at": Leaves["appliedAt"];
  "approved_at": Leaves["approvedAt"];
  "approved_by": Leaves["approvedBy"];
  "document_url": Leaves["documentUrl"];
  "end_date": Leaves["endDate"];
  "is_emergency": Leaves["isEmergency"];
  "leave_type_id": Leaves["leaveTypeId"];
  "reason": Leaves["reason"];
  "reject_reason": Leaves["rejectReason"];
  "start_date": Leaves["startDate"];
  "status": Leaves["status"];
  "user_id": Leaves["userId"];
};

export type LeavesInitialValues = LeavesPayload;
export type LeavesDefaultValues = Partial<LeavesPayload>;
export type LeavesFormValues = LeavesPayload;

export const LeavesMetadata = {
  resource: "leaves",
  label: "Leaves",
  fields: [
    { name: "applied_at", label: "Applied At", uiType: "date", required: true },
    { name: "approved_at", label: "Approved At", uiType: "date", required: true },
    { name: "approved_by", label: "Approved By", uiType: "number", required: true },
    { name: "document_url", label: "Document Url", uiType: "text", required: true },
    { name: "end_date", label: "End Date", uiType: "date", required: true },
    { name: "is_emergency", label: "Is Emergency", uiType: "boolean", required: true },
    { name: "leave_type_id", label: "Leave Type Id", uiType: "number", required: true },
    { name: "reason", label: "Reason", uiType: "text", required: true },
    { name: "reject_reason", label: "Reject Reason", uiType: "text", required: true },
    { name: "start_date", label: "Start Date", uiType: "date", required: true },
    { name: "status", label: "Status", uiType: "text", required: true },
    { name: "user_id", label: "User Id", uiType: "number", required: true }
  ]
};
