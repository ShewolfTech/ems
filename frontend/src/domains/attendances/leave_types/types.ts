// Auto-generated types for LeaveTypes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type LeaveTypes = {
  [K in keyof DB["leaveTypes"]]: Unwrap<DB["leaveTypes"][K]>;
};

export type CreateLeaveTypes = Omit<LeaveTypes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateLeaveTypes = Partial<CreateLeaveTypes>;

export type LeaveTypesPayload = {
  "code": LeaveTypes["code"];
  "description": LeaveTypes["description"];
  "is_active": LeaveTypes["isActive"];
  "is_for_staff": LeaveTypes["isForStaff"];
  "is_for_students": LeaveTypes["isForStudents"];
  "is_paid": LeaveTypes["isPaid"];
  "max_days_per_year": LeaveTypes["maxDaysPerYear"];
  "name": LeaveTypes["name"];
  "requires_approval": LeaveTypes["requiresApproval"];
  "requires_document": LeaveTypes["requiresDocument"];
};

export type LeaveTypesInitialValues = LeaveTypesPayload;
export type LeaveTypesDefaultValues = Partial<LeaveTypesPayload>;
export type LeaveTypesFormValues = LeaveTypesPayload;

export const LeaveTypesMetadata = {
  resource: "leaveTypes",
  label: "Leave Types",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_for_staff", label: "Is For Staff", uiType: "boolean", required: true },
    { name: "is_for_students", label: "Is For Students", uiType: "boolean", required: true },
    { name: "is_paid", label: "Is Paid", uiType: "boolean", required: true },
    { name: "max_days_per_year", label: "Max Days Per Year", uiType: "number", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "requires_approval", label: "Requires Approval", uiType: "boolean", required: true },
    { name: "requires_document", label: "Requires Document", uiType: "boolean", required: true }
  ]
};
