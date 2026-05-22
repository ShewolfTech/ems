import * as service from "./services.js";

export const loadMessagesList = (p?: any) => service.getMessagesList(p);
export const loadMessagesMeta = () => service.getMessagesMeta();
export const loadMessagesSidebar = () => service.getMessagesSidebar();
export const saveMessages = (d: any) => service.saveMessages(d);
export const removeMessages = (id: any) => service.removeMessages(id);