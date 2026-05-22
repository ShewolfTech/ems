import * as service from "./services.js";

export const loadSchoolsList = (p?: any) => service.getSchoolsList(p);
export const loadSchoolsMeta = () => service.getSchoolsMeta();
export const loadSchoolsSidebar = () => service.getSchoolsSidebar();
export const saveSchools = (d: any) => service.saveSchools(d);
export const removeSchools = (id: any) => service.removeSchools(id);