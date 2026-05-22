import * as service from "./services.js";

export const loadAttendanceSessionsList = (p?: any) => service.getAttendanceSessionsList(p);
export const loadAttendanceSessionsMeta = () => service.getAttendanceSessionsMeta();
export const loadAttendanceSessionsSidebar = () => service.getAttendanceSessionsSidebar();
export const saveAttendanceSessions = (d: any) => service.saveAttendanceSessions(d);
export const removeAttendanceSessions = (id: any) => service.removeAttendanceSessions(id);