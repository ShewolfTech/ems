import * as service from "./services.js";

export const loadRolePermissionsList = (p?: any) => service.getRolePermissionsList(p);
export const loadRolePermissionsMeta = () => service.getRolePermissionsMeta();
export const loadRolePermissionsSidebar = () => service.getRolePermissionsSidebar();
export const saveRolePermissions = (d: any) => service.saveRolePermissions(d);
export const removeRolePermissions = (id: any) => service.removeRolePermissions(id);