import * as service from "./services.js";

export const loadWebhooksList = (p?: any) => service.getWebhooksList(p);
export const loadWebhooksMeta = () => service.getWebhooksMeta();
export const loadWebhooksSidebar = () => service.getWebhooksSidebar();
export const saveWebhooks = (d: any) => service.saveWebhooks(d);
export const removeWebhooks = (id: any) => service.removeWebhooks(id);