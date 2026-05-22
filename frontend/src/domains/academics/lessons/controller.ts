import * as service from "./services.js";

export const loadLessonsList = (p?: any) => service.getLessonsList(p);
export const loadLessonsMeta = () => service.getLessonsMeta();
export const loadLessonsSidebar = () => service.getLessonsSidebar();
export const saveLessons = (d: any) => service.saveLessons(d);
export const removeLessons = (id: any) => service.removeLessons(id);