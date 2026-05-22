import * as service from "./services.js";

export const loadAcademicsStudentsgradesViewList = (p?: any) => service.getAcademicsStudentsgradesViewList(p);
export const loadAcademicsStudentsgradesViewMeta = () => service.getAcademicsStudentsgradesViewMeta();
export const loadAcademicsStudentsgradesViewSidebar = () => service.getAcademicsStudentsgradesViewSidebar();
export const saveAcademicsStudentsgradesView = (d: any) => service.saveAcademicsStudentsgradesView(d);
export const removeAcademicsStudentsgradesView = (id: any) => service.removeAcademicsStudentsgradesView(id);