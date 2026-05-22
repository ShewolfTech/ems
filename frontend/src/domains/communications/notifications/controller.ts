import * as service from "./services.js";

export const loadNotificationsList = (p?: any) => service.getNotificationsList(p);
export const loadNotificationsMeta = () => service.getNotificationsMeta();
export const loadNotificationsSidebar = () => service.getNotificationsSidebar();
export const saveNotifications = (d: any) => service.saveNotifications(d);
export const removeNotifications = (id: any) => service.removeNotifications(id);