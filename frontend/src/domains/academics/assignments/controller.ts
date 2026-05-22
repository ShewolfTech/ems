import * as service from "./services.js";

export const loadAssignmentsList = (p?: any) => service.getAssignmentsList(p);
export const loadAssignmentById = (id: any) => service.getAssignmentById(id);
export const loadAssignmentsMeta = () => service.getAssignmentsMeta();
export const loadAssignmentsSidebar = () => service.getAssignmentsSidebar();
export const saveAssignments = (d: any) => service.saveAssignments(d);
export const removeAssignments = (id: any) => service.removeAssignments(id);
export const bulkCreateSubmissions = (d: any) => service.bulkCreateSubmissions(d);
export const loadAssignmentsAnalytics = (params: any) => service.getAssignmentsAnalytics(params);