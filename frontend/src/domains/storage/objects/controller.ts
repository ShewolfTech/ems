import * as service from "./services.js";

export const loadObjectsList = (p?: any) => service.getObjectsList(p);
export const loadObjectsMeta = () => service.getObjectsMeta();
export const loadObjectsSidebar = () => service.getObjectsSidebar();
export const saveObjects = (d: any) => service.saveObjects(d);
export const removeObjects = (id: any) => service.removeObjects(id);