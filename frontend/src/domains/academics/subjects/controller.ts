import * as service from "./services.js";

export const loadSubjectsList = (p?: any) => service.getSubjectsList(p);
export const loadSubjectsMeta = () => service.getSubjectsMeta();
export const loadSubjectsSidebar = () => service.getSubjectsSidebar();
export const saveSubjects = (d: any) => service.saveSubjects(d);
export const removeSubjects = (id: any) => service.removeSubjects(id);