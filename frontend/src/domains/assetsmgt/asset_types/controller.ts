import * as service from "./services.js";

export const loadAssetTypesList = (p?: any) => service.getAssetTypesList(p);
export const loadAssetTypesMeta = () => service.getAssetTypesMeta();
export const loadAssetTypesSidebar = () => service.getAssetTypesSidebar();
export const saveAssetTypes = (d: any) => service.saveAssetTypes(d);
export const removeAssetTypes = (id: any) => service.removeAssetTypes(id);