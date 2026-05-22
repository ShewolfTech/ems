import * as service from "./services.js";

export const loadAttendanceList = (p?: any) => service.getStaffAttendanceList(p);
export const loadAttendance = (id: number) => service.getStaffAttendance(id);
export const saveAttendance = (d: any) => service.saveStaffAttendance(d);
export const removeAttendance = (id: number) => service.removeStaffAttendance(id);
export const doClockIn = (data: any) => service.clockIn(data);
export const doClockOut = (data: any) => service.clockOut(data);
export const loadTodaySummary = () => service.getTodaySummary();
export const loadAttendanceStatistics = (p?: any) => service.getAttendanceStatistics(p);
export const loadStaffMonthlySummary = (staff_id: number, month: number, year: number) => 
  service.getStaffMonthlySummary(staff_id, month, year);
export const loadAttendanceAnalytics = (p?: any) => service.getAttendanceAnalytics(p);
