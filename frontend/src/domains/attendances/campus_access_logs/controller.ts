import * as service from "./services.js";

export const loadCampusAccessLogsList = (p?: any) => service.getCampusAccessLogsList(p);
export const loadCampusAccessLogsMeta = () => service.getCampusAccessLogsMeta();
export const loadCampusAccessLogsSidebar = () => service.getCampusAccessLogsSidebar();
export const saveCampusAccessLogs = (d: any) => service.saveCampusAccessLogs(d);
export const removeCampusAccessLogs = (id: any) => service.removeCampusAccessLogs(id);