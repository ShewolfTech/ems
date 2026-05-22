import * as service from "./services.js";

export const loadReportLeaveSummaryList = (p?: any) => service.getReportLeaveSummaryList(p);
export const loadReportLeaveSummaryMeta = () => service.getReportLeaveSummaryMeta();
export const loadReportLeaveSummarySidebar = () => service.getReportLeaveSummarySidebar();
export const saveReportLeaveSummary = (d: any) => service.saveReportLeaveSummary(d);
export const removeReportLeaveSummary = (id: any) => service.removeReportLeaveSummary(id);