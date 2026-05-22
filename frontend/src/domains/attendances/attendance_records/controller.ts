import * as service from "./services.js";

export const loadAttendanceRecordsList = (p?: any) => service.getAttendanceRecordsList(p);
export const loadAttendanceRecordsMeta = () => service.getAttendanceRecordsMeta();
export const loadAttendanceRecordsSidebar = () => service.getAttendanceRecordsSidebar();
export const saveAttendanceRecords = (d: any) => service.saveAttendanceRecords(d);
export const removeAttendanceRecords = (id: any) => service.removeAttendanceRecords(id);