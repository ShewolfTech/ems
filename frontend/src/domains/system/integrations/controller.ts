import * as service from "./services.js";

export const loadIntegrationsList = (p?: any) => service.getIntegrationsList(p);
export const loadIntegrationsMeta = () => service.getIntegrationsMeta();
export const loadIntegrationsSidebar = () => service.getIntegrationsSidebar();
export const saveIntegrations = (d: any) => service.saveIntegrations(d);
export const removeIntegrations = (id: any) => service.removeIntegrations(id);