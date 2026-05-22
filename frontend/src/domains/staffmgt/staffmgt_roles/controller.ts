import * as service from "./services.js";

export const loadStaffmgtRolesList = (p?: any) => service.getStaffmgtRolesList(p);
export const loadStaffmgtRolesMeta = () => service.getStaffmgtRolesMeta();
export const loadStaffmgtRolesSidebar = () => service.getStaffmgtRolesSidebar();
export const saveStaffmgtRoles = (d: any) => service.saveStaffmgtRoles(d);
export const removeStaffmgtRoles = (id: any) => service.removeStaffmgtRoles(id);