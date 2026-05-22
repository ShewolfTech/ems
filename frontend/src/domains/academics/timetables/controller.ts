import * as service from "./services.js";

export const loadTimetablesList = (p?: any) => service.getTimetablesList(p);
export const loadTimetablesMeta = () => service.getTimetablesMeta();
export const loadTimetablesSidebar = () => service.getTimetablesSidebar();
export const saveTimetables = (d: any) => service.saveTimetables(d);
export const removeTimetables = (id: any) => service.removeTimetables(id);