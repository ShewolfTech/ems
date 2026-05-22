// Auto-generated types for StaffmgtPromotionHistoryView domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type StaffmgtPromotionHistoryView = {
  [K in keyof DB["staffmgtPromotionHistoryView"]]: Unwrap<DB["staffmgtPromotionHistoryView"][K]>;
};

export type CreateStaffmgtPromotionHistoryView = Omit<StaffmgtPromotionHistoryView, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateStaffmgtPromotionHistoryView = Partial<CreateStaffmgtPromotionHistoryView>;

export type StaffmgtPromotionHistoryViewPayload = {
  "employee_no": StaffmgtPromotionHistoryView["employeeNo"];
  "hire_date": StaffmgtPromotionHistoryView["hireDate"];
  "is_active": StaffmgtPromotionHistoryView["isActive"];
  "new_department_id": StaffmgtPromotionHistoryView["newDepartmentId"];
  "new_department_name": StaffmgtPromotionHistoryView["newDepartmentName"];
  "new_role_id": StaffmgtPromotionHistoryView["newRoleId"];
  "new_role_name": StaffmgtPromotionHistoryView["newRoleName"];
  "old_department_id": StaffmgtPromotionHistoryView["oldDepartmentId"];
  "old_department_name": StaffmgtPromotionHistoryView["oldDepartmentName"];
  "old_role_id": StaffmgtPromotionHistoryView["oldRoleId"];
  "old_role_name": StaffmgtPromotionHistoryView["oldRoleName"];
  "promotion_date": StaffmgtPromotionHistoryView["promotionDate"];
  "promotion_id": StaffmgtPromotionHistoryView["promotionId"];
  "remarks": StaffmgtPromotionHistoryView["remarks"];
  "staffmgt_id": StaffmgtPromotionHistoryView["staffmgtId"];
};

export type StaffmgtPromotionHistoryViewInitialValues = StaffmgtPromotionHistoryViewPayload;
export type StaffmgtPromotionHistoryViewDefaultValues = Partial<StaffmgtPromotionHistoryViewPayload>;
export type StaffmgtPromotionHistoryViewFormValues = StaffmgtPromotionHistoryViewPayload;

export const StaffmgtPromotionHistoryViewMetadata = {
  resource: "staffmgtPromotionHistoryView",
  label: "Staffmgt Promotion History View",
  fields: [
    { name: "employee_no", label: "Employee No", uiType: "text", required: true },
    { name: "hire_date", label: "Hire Date", uiType: "date", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "new_department_id", label: "New Department Id", uiType: "number", required: true },
    { name: "new_department_name", label: "New Department Name", uiType: "text", required: true },
    { name: "new_role_id", label: "New Role Id", uiType: "number", required: true },
    { name: "new_role_name", label: "New Role Name", uiType: "text", required: true },
    { name: "old_department_id", label: "Old Department Id", uiType: "number", required: true },
    { name: "old_department_name", label: "Old Department Name", uiType: "text", required: true },
    { name: "old_role_id", label: "Old Role Id", uiType: "number", required: true },
    { name: "old_role_name", label: "Old Role Name", uiType: "text", required: true },
    { name: "promotion_date", label: "Promotion Date", uiType: "date", required: true },
    { name: "promotion_id", label: "Promotion Id", uiType: "number", required: true },
    { name: "remarks", label: "Remarks", uiType: "text", required: true },
    { name: "staffmgt_id", label: "Staffmgt Id", uiType: "number", required: true }
  ]
};
