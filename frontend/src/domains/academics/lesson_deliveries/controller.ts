import * as service from "./services.js";

export const loadLessonDeliveriesList = (p?: any) => service.getLessonDeliveriesList(p);
export const loadLessonDelivery = (id: number | string) => service.getLessonDeliveryById(id);
export const loadLessonDeliveryStats = (p?: any) => service.getLessonDeliveryStats(p);
export const loadTodaysLessonDeliveries = (p?: any) => service.getTodaysLessonDeliveries(p);
export const loadLessonsByDate = (date: string, p?: any) => service.getLessonsByDate(date, p);
export const loadDeliveryHistoryForLesson = (lessonId: number | string) => service.getDeliveryHistoryForLesson(lessonId);
export const saveLessonDelivery = (d: any) => service.saveLessonDelivery(d);
export const removeLessonDelivery = (id: any) => service.removeLessonDelivery(id);
export const quickMarkDelivered = (id: number | string, data: any) => service.markDelivered(id, data);
export const quickMarkCancelled = (id: number | string, data: any) => service.markCancelled(id, data);
export const quickMarkPostponed = (id: number | string, data: any) => service.markPostponed(id, data);
export const generateDeliveriesFromTimetables = (data: any) => service.generateDeliveriesFromTimetables(data);
