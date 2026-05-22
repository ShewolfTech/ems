import * as service from "./services.js";

export const loadUserPermissionsList = (p?: any) => service.getUserPermissionsList(p);
export const loadUserPermissionsMeta = () => service.getUserPermissionsMeta();
export const loadUserPermissionsSidebar = () => service.getUserPermissionsSidebar();
export const saveUserPermissions = (d: any) => service.saveUserPermissions(d);
export const removeUserPermissions = (id: any) => service.removeUserPermissions(id);