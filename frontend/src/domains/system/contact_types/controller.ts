import * as service from "./services.js";

export const loadContactTypesList = (p?: any) => service.getContactTypesList(p);
export const loadContactTypesMeta = () => service.getContactTypesMeta();
export const loadContactTypesSidebar = () => service.getContactTypesSidebar();
export const saveContactTypes = (d: any) => service.saveContactTypes(d);
export const removeContactTypes = (id: any) => service.removeContactTypes(id);