import * as service from "./services.js";

export const loadEmploymentTypesList = (p?: any) => service.getEmploymentTypesList(p);
export const loadEmploymentTypesMeta = () => service.getEmploymentTypesMeta();
export const loadEmploymentTypesSidebar = () => service.getEmploymentTypesSidebar();
export const saveEmploymentTypes = (d: any) => service.saveEmploymentTypes(d);
export const removeEmploymentTypes = (id: any) => service.removeEmploymentTypes(id);