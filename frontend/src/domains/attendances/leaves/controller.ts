import * as service from "./services.js";

export const loadLeavesList = (p?: any) => service.getLeavesList(p);
export const loadLeavesMeta = () => service.getLeavesMeta();
export const loadLeavesSidebar = () => service.getLeavesSidebar();
export const saveLeaves = (d: any) => service.saveLeaves(d);
export const removeLeaves = (id: any) => service.removeLeaves(id);