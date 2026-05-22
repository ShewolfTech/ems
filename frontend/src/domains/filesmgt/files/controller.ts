import * as service from "./services.js";

export const loadFilesList = (p?: any) => service.getFilesList(p);
export const loadFilesMeta = () => service.getFilesMeta();
export const loadFilesSidebar = () => service.getFilesSidebar();
export const saveFiles = (d: any) => service.saveFiles(d);
export const removeFiles = (id: any) => service.removeFiles(id);