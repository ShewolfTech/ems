import type { Permission } from "./validator.js";

export type { Permission };

export interface SidebarMenu {
  [moduleName: string]: Permission[];
}

export type UpdatePermissionInput = Partial<Permission>;