// Auto-generated types for RelationshipTypes domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type RelationshipTypes = {
  [K in keyof DB["relationshipTypes"]]: Unwrap<DB["relationshipTypes"][K]>;
};

export type CreateRelationshipTypes = Omit<RelationshipTypes, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateRelationshipTypes = Partial<CreateRelationshipTypes>;

export type RelationshipTypesPayload = {
  "is_active": RelationshipTypes["isActive"];
  "name": RelationshipTypes["name"];
};

export type RelationshipTypesInitialValues = RelationshipTypesPayload;
export type RelationshipTypesDefaultValues = Partial<RelationshipTypesPayload>;
export type RelationshipTypesFormValues = RelationshipTypesPayload;

export const RelationshipTypesMetadata = {
  resource: "relationshipTypes",
  label: "Relationship Types",
  fields: [
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
