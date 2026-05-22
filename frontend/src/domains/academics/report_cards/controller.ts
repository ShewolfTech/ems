import * as service from "./services.js";

export const loadReportCardsList = (p?: any) => service.getReportCardsList(p);
export const loadReportCardsMeta = () => service.getReportCardsMeta();
export const loadReportCardsSidebar = () => service.getReportCardsSidebar();
export const saveReportCards = (d: any) => service.saveReportCards(d);
export const removeReportCards = (id: any) => service.removeReportCards(id);