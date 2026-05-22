import * as service from "./services.js";

export const loadUserRolesList = (p?: any) => service.getUserRolesList(p);
export const loadUserRolesMeta = () => service.getUserRolesMeta();
export const loadUserRolesSidebar = () => service.getUserRolesSidebar();
export const saveUserRoles = (d: any) => service.saveUserRoles(d);
export const removeUserRoles = (id: any) => service.removeUserRoles(id);