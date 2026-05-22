import * as service from "./services.js";

export const loadAuditrouteReportList = (p?: any) => service.getAuditrouteReportList(p);
export const loadAuditrouteReportMeta = () => service.getAuditrouteReportMeta();
export const loadAuditrouteReportSidebar = () => service.getAuditrouteReportSidebar();
export const saveAuditrouteReport = (d: any) => service.saveAuditrouteReport(d);
export const removeAuditrouteReport = (id: any) => service.removeAuditrouteReport(id);