// Auto-generated types for RoutePermissions domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type RoutePermissions = {
  [K in keyof DB["routePermissions"]]: Unwrap<DB["routePermissions"][K]>;
};

export type CreateRoutePermissions = Omit<RoutePermissions, "id" | "schoolId" | "school_id" | "userId" | "user_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | "is_deleted" | "isDeleted">;
export type UpdateRoutePermissions = Partial<CreateRoutePermissions>;

export type RoutePermissionsPayload = {
  "action": RoutePermissions["action"];
  "display_name": RoutePermissions["displayName"];
  "display_order": RoutePermissions["displayOrder"];
  "icon": RoutePermissions["icon"];
  "is_active": RoutePermissions["isActive"];
  "is_global": RoutePermissions["isGlobal"];
  "is_menu_item": RoutePermissions["isMenuItem"];
  "method": RoutePermissions["method"];
  "module": RoutePermissions["module"];
  "permission_key": RoutePermissions["permissionKey"];
  "resource": RoutePermissions["resource"];
  "route": RoutePermissions["route"];
  "route_type": RoutePermissions["routeType"];
};

export type RoutePermissionsInitialValues = RoutePermissionsPayload;
export type RoutePermissionsDefaultValues = Partial<RoutePermissionsPayload>;
export type RoutePermissionsFormValues = RoutePermissionsPayload;

export const RoutePermissionsMetadata = {
  resource: "routePermissions",
  label: "Route Permissions",
  fields: [
    { name: "action", label: "Action", uiType: "text", required: true },
    { name: "display_name", label: "Display Name", uiType: "text", required: true },
    { name: "display_order", label: "Display Order", uiType: "number", required: true },
    { name: "icon", label: "Icon", uiType: "text", required: true },
    { name: "is_active", label: "Is Active", uiType: "boolean", required: true },
    { name: "is_global", label: "Is Global", uiType: "boolean", required: true },
    { name: "is_menu_item", label: "Is Menu Item", uiType: "boolean", required: true },
    { name: "method", label: "Method", uiType: "text", required: true },
    { name: "module", label: "Module", uiType: "text", required: true },
    { name: "permission_key", label: "Permission Key", uiType: "text", required: true },
    { name: "resource", label: "Resource", uiType: "text", required: true },
    { name: "route", label: "Route", uiType: "text", required: true },
    { name: "route_type", label: "Route Type", uiType: "text", required: true }
  ]
};
