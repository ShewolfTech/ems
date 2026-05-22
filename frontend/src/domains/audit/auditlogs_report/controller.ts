import * as service from "./services.js";

export const loadAuditlogsReportList = (p?: any) => service.getAuditlogsReportList(p);
export const loadAuditlogsReportMeta = () => service.getAuditlogsReportMeta();
export const loadAuditlogsReportSidebar = () => service.getAuditlogsReportSidebar();
export const saveAuditlogsReport = (d: any) => service.saveAuditlogsReport(d);
export const removeAuditlogsReport = (id: any) => service.removeAuditlogsReport(id);