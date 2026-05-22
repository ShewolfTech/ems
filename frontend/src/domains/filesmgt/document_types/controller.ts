import * as service from "./services.js";

export const loadDocumentTypesList = (p?: any) => service.getDocumentTypesList(p);
export const loadDocumentTypesMeta = () => service.getDocumentTypesMeta();
export const loadDocumentTypesSidebar = () => service.getDocumentTypesSidebar();
export const saveDocumentTypes = (d: any) => service.saveDocumentTypes(d);
export const removeDocumentTypes = (id: any) => service.removeDocumentTypes(id);