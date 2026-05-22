import * as service from "./services.js";

export const loadDepartmentsList = (p?: any) => service.getDepartmentsList(p);
export const loadDepartmentsMeta = () => service.getDepartmentsMeta();
export const loadDepartmentsSidebar = () => service.getDepartmentsSidebar();
export const saveDepartments = (d: any) => service.saveDepartments(d);
export const removeDepartments = (id: any) => service.removeDepartments(id);