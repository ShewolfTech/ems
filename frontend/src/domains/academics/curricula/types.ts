// Auto-generated types for Curricula domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type Curricula = {
  [K in keyof DB["curricula"]]: Unwrap<DB["curricula"][K]>;
};

export type CreateCurricula = Omit<Curricula, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateCurricula = Partial<CreateCurricula>;

export type CurriculaPayload = {
  "code": Curricula["code"];
  "description": Curricula["description"];
  "is_active": Curricula["isActive"];
  "name": Curricula["name"];
};

export type CurriculaInitialValues = CurriculaPayload;
export type CurriculaDefaultValues = Partial<CurriculaPayload>;
export type CurriculaFormValues = CurriculaPayload;

export const CurriculaMetadata = {
  resource: "curricula",
  label: "Curricula",
  fields: [
    { name: "code", label: "Code", uiType: "text", required: true },
    { name: "description", label: "Description", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "name", label: "Name", uiType: "text", required: true }
  ]
};
