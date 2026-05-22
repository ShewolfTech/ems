import * as service from "./services.js";

export const loadAttendancePoliciesList = (p?: any) => service.getAttendancePoliciesList(p);
export const loadAttendancePoliciesMeta = () => service.getAttendancePoliciesMeta();
export const loadAttendancePoliciesSidebar = () => service.getAttendancePoliciesSidebar();
export const saveAttendancePolicies = (d: any) => service.saveAttendancePolicies(d);
export const removeAttendancePolicies = (id: any) => service.removeAttendancePolicies(id);