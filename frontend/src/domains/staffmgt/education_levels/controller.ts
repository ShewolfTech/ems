import * as service from "./services.js";

export const loadEducationLevelsList = (p?: any) => service.getEducationLevelsList(p);
export const loadEducationLevelsMeta = () => service.getEducationLevelsMeta();
export const loadEducationLevelsSidebar = () => service.getEducationLevelsSidebar();
export const saveEducationLevels = (d: any) => service.saveEducationLevels(d);
export const removeEducationLevels = (id: any) => service.removeEducationLevels(id);