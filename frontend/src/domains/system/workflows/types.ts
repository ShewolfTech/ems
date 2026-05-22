// Auto-generated types for Workflows domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Workflows = {
  [K in keyof DB["workflows"]]: Unwrap<DB["workflows"][K]>;
};

export type CreateWorkflows = Omit<Workflows, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateWorkflows = Partial<CreateWorkflows>;

export type WorkflowsPayload = {
  "config": Workflows["config"];
  "is_active": Workflows["isActive"];
  "name": Workflows["name"];
  "type": Workflows["type"];
};

export type WorkflowsInitialValues = WorkflowsPayload;
export type WorkflowsDefaultValues = Partial<WorkflowsPayload>;
export type WorkflowsFormValues = WorkflowsPayload;

export const WorkflowsMetadata = {
  resource: "workflows",
  label: "Workflows",
  fields: [
    { name: "config", label: "Config", uiType: "json", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true },
    { name: "type", label: "Type", uiType: "text", required: true }
  ]
};
