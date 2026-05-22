import * as service from "./services.js";

export const loadApiKeysList = (p?: any) => service.getApiKeysList(p);
export const loadApiKeysMeta = () => service.getApiKeysMeta();
export const loadApiKeysSidebar = () => service.getApiKeysSidebar();
export const saveApiKeys = (d: any) => service.saveApiKeys(d);
export const removeApiKeys = (id: any) => service.removeApiKeys(id);