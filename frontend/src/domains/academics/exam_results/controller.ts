import * as service from "./services.js";

export const loadExamResultsList = (p?: any) => service.getExamResultsList(p);
export const loadExamResultsMeta = () => service.getExamResultsMeta();
export const loadExamResultsSidebar = () => service.getExamResultsSidebar();
export const saveExamResults = (d: any) => service.saveExamResults(d);
export const removeExamResults = (id: any) => service.removeExamResults(id);