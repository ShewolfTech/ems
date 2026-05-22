import * as service from "./services.js";

export const loadStaffList = (p?: any) => service.getStaffList(p);
export const loadStaffMeta = () => service.getStaffMeta();
export const loadStaffSidebar = () => service.getStaffSidebar();
export const saveStaff = (d: any) => service.saveStaff(d);
export const removeStaff = (id: any) => service.removeStaff(id);

// New enhanced API calls
export const getStaffStatistics = () => service.getStaffStatistics();
export const getDepartments = () => service.getDepartments();
export const getStaffRoles = (p?: any) => service.getStaffRoles(p);