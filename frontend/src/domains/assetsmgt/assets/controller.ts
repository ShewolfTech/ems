import * as service from "./services.js";

export const loadAssetsList = (p?: any) => service.getAssetsList(p);
export const loadAssetsMeta = () => service.getAssetsMeta();
export const loadAssetsSidebar = () => service.getAssetsSidebar();
export const saveAssets = (d: any) => service.saveAssets(d);
export const removeAssets = (id: any) => service.removeAssets(id);