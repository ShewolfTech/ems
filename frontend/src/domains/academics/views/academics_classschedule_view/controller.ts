import * as service from "./services.js";

export const loadAcademicsClassscheduleViewList = (p?: any) => service.getAcademicsClassscheduleViewList(p);
export const loadAcademicsClassscheduleViewMeta = () => service.getAcademicsClassscheduleViewMeta();
export const loadAcademicsClassscheduleViewSidebar = () => service.getAcademicsClassscheduleViewSidebar();
export const saveAcademicsClassscheduleView = (d: any) => service.saveAcademicsClassscheduleView(d);
export const removeAcademicsClassscheduleView = (id: any) => service.removeAcademicsClassscheduleView(id);