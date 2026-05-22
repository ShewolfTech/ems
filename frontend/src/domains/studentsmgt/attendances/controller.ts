import * as service from "./services.js";

export const loadAttendancesList = (p?: any) => service.getAttendancesList(p);
export const loadAttendancesMeta = () => service.getAttendancesMeta();
export const loadAttendancesSidebar = () => service.getAttendancesSidebar();
export const saveAttendances = (d: any) => service.saveAttendances(d);
export const removeAttendances = (id: any) => service.removeAttendances(id);