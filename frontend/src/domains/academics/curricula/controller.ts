import * as service from "./services.js";

export const loadCurriculaList = (p?: any) => service.getCurriculaList(p);
export const loadCurriculaMeta = () => service.getCurriculaMeta();
export const loadCurriculaSidebar = () => service.getCurriculaSidebar();
export const saveCurricula = (d: any) => service.saveCurricula(d);
export const removeCurricula = (id: any) => service.removeCurricula(id);