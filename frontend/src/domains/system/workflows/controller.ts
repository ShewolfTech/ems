import * as service from "./services.js";

export const loadWorkflowsList = (p?: any) => service.getWorkflowsList(p);
export const loadWorkflowsMeta = () => service.getWorkflowsMeta();
export const loadWorkflowsSidebar = () => service.getWorkflowsSidebar();
export const saveWorkflows = (d: any) => service.saveWorkflows(d);
export const removeWorkflows = (id: any) => service.removeWorkflows(id);