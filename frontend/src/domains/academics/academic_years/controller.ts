import * as service from "./services.js";

export const loadAcademicYearsList = (p?: any) => service.getAcademicYearsList(p);
export const loadAcademicYearsMeta = () => service.getAcademicYearsMeta();
export const loadAcademicYearsSidebar = () => service.getAcademicYearsSidebar();
export const saveAcademicYears = (d: any) => service.saveAcademicYears(d);
export const removeAcademicYears = (id: any) => service.removeAcademicYears(id);