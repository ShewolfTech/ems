import * as service from "./services.js";

export const loadAssessmentsList = (p?: any) => service.getAssessmentsList(p);
export const loadAssessmentsMeta = () => service.getAssessmentsMeta();
export const loadAssessmentsSidebar = () => service.getAssessmentsSidebar();
export const saveAssessments = (d: any) => service.saveAssessments(d);
export const removeAssessments = (id: any) => service.removeAssessments(id);