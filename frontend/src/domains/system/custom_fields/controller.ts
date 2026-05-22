import * as service from "./services.js";

export const loadCustomFieldsList = (p?: any) => service.getCustomFieldsList(p);
export const loadCustomFieldsMeta = () => service.getCustomFieldsMeta();
export const loadCustomFieldsSidebar = () => service.getCustomFieldsSidebar();
export const saveCustomFields = (d: any) => service.saveCustomFields(d);
export const removeCustomFields = (id: any) => service.removeCustomFields(id);