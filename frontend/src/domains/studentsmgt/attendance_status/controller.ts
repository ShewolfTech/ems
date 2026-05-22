import * as service from "./services.js";

export const loadAttendanceStatusList = (p?: any) => service.getAttendanceStatusList(p);
export const loadAttendanceStatusMeta = () => service.getAttendanceStatusMeta();
export const loadAttendanceStatusSidebar = () => service.getAttendanceStatusSidebar();
export const saveAttendanceStatus = (d: any) => service.saveAttendanceStatus(d);
export const removeAttendanceStatus = (id: any) => service.removeAttendanceStatus(id);