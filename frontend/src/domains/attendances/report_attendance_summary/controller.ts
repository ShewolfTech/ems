import * as service from "./services.js";

export const loadReportAttendanceSummaryList = (p?: any) => service.getReportAttendanceSummaryList(p);
export const loadReportAttendanceSummaryMeta = () => service.getReportAttendanceSummaryMeta();
export const loadReportAttendanceSummarySidebar = () => service.getReportAttendanceSummarySidebar();
export const saveReportAttendanceSummary = (d: any) => service.saveReportAttendanceSummary(d);
export const removeReportAttendanceSummary = (id: any) => service.removeReportAttendanceSummary(id);