import * as service from "./services.js";

export const loadSettingsList = (p?: any) => service.getSettingsList(p);
export const loadSettingsMeta = () => service.getSettingsMeta();
export const loadSettingsSidebar = () => service.getSettingsSidebar();
export const saveSettings = (d: any) => service.saveSettings(d);
export const removeSettings = (id: any) => service.removeSettings(id);