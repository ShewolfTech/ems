import * as service from "./services.js";

export const loadRolesList = (p?: any) => service.getRolesList(p);
export const loadRolesMeta = () => service.getRolesMeta();
export const loadRolesSidebar = () => service.getRolesSidebar();
export const saveRoles = (d: any) => service.saveRoles(d);
export const removeRoles = (id: any) => service.removeRoles(id);