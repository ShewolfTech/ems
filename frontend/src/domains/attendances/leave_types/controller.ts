import * as service from "./services.js";

export const loadLeaveTypesList = (p?: any) => service.getLeaveTypesList(p);
export const loadLeaveTypesMeta = () => service.getLeaveTypesMeta();
export const loadLeaveTypesSidebar = () => service.getLeaveTypesSidebar();
export const saveLeaveTypes = (d: any) => service.saveLeaveTypes(d);
export const removeLeaveTypes = (id: any) => service.removeLeaveTypes(id);