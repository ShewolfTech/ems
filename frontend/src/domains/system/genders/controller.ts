import * as service from "./services.js";

export const loadGendersList = (p?: any) => service.getGendersList(p);
export const loadGendersMeta = () => service.getGendersMeta();
export const loadGendersSidebar = () => service.getGendersSidebar();
export const saveGenders = (d: any) => service.saveGenders(d);
export const removeGenders = (id: any) => service.removeGenders(id);