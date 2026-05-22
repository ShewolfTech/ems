import * as service from "./services.js";

export const loadExamsList = (p?: any) => service.getExamsList(p);
export const loadExamsMeta = () => service.getExamsMeta();
export const loadExamsSidebar = () => service.getExamsSidebar();
export const saveExams = (d: any) => service.saveExams(d);
export const removeExams = (id: any) => service.removeExams(id);