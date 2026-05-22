import * as service from "./services.js";

export const loadAssetMaintenanceLogsList = (p?: any) => service.getAssetMaintenanceLogsList(p);
export const loadAssetMaintenanceLogsMeta = () => service.getAssetMaintenanceLogsMeta();
export const loadAssetMaintenanceLogsSidebar = () => service.getAssetMaintenanceLogsSidebar();
export const saveAssetMaintenanceLogs = (d: any) => service.saveAssetMaintenanceLogs(d);
export const removeAssetMaintenanceLogs = (id: any) => service.removeAssetMaintenanceLogs(id);