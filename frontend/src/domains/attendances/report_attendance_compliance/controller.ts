import * as service from "./services.js";

export const loadReportAttendanceComplianceList = (p?: any) => service.getReportAttendanceComplianceList(p);
export const loadReportAttendanceComplianceMeta = () => service.getReportAttendanceComplianceMeta();
export const loadReportAttendanceComplianceSidebar = () => service.getReportAttendanceComplianceSidebar();
export const saveReportAttendanceCompliance = (d: any) => service.saveReportAttendanceCompliance(d);
export const removeReportAttendanceCompliance = (id: any) => service.removeReportAttendanceCompliance(id);