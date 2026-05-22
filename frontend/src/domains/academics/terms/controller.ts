import * as service from "./services.js";

export const loadTermsList = (p?: any) => service.getTermsList(p);
export const loadTermsMeta = () => service.getTermsMeta();
export const loadTermsSidebar = () => service.getTermsSidebar();
export const saveTerms = (d: any) => service.saveTerms(d);
export const removeTerms = (id: any) => service.removeTerms(id);