import * as service from "./services.js";

export const loadApplicationsList = (p?: any) => service.getApplicationsList(p);
export const loadApplication = (id: any) => service.getApplication(id);
export const saveApplication = (d: any) => service.saveApplication(d);
export const removeApplication = (id: any) => service.removeApplication(id);