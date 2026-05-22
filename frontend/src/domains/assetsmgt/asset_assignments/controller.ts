import * as service from "./services.js";

export const loadAssetAssignmentsList = (p?: any) => service.getAssetAssignmentsList(p);
export const loadAssetAssignmentsMeta = () => service.getAssetAssignmentsMeta();
export const loadAssetAssignmentsSidebar = () => service.getAssetAssignmentsSidebar();
export const saveAssetAssignments = (d: any) => service.saveAssetAssignments(d);
export const removeAssetAssignments = (id: any) => service.removeAssetAssignments(id);