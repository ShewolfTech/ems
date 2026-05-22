import * as service from "./services.js";

export const loadAcademicsAssignmentSubmissionsViewList = (p?: any) => service.getAcademicsAssignmentSubmissionsViewList(p);
export const loadAcademicsAssignmentSubmissionsViewMeta = () => service.getAcademicsAssignmentSubmissionsViewMeta();
export const loadAcademicsAssignmentSubmissionsViewSidebar = () => service.getAcademicsAssignmentSubmissionsViewSidebar();
export const saveAcademicsAssignmentSubmissionsView = (d: any) => service.saveAcademicsAssignmentSubmissionsView(d);
export const removeAcademicsAssignmentSubmissionsView = (id: any) => service.removeAcademicsAssignmentSubmissionsView(id);