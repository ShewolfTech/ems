import * as service from "./services.js";

export const loadGradeLevelsList = (p?: any) => service.getGradeLevelsList(p);
export const loadGradeLevelsMeta = () => service.getGradeLevelsMeta();
export const loadGradeLevelsSidebar = () => service.getGradeLevelsSidebar();
export const saveGradeLevels = (d: any) => service.saveGradeLevels(d);
export const removeGradeLevels = (id: any) => service.removeGradeLevels(id);