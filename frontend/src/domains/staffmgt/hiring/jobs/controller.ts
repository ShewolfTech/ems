import * as service from "./services.js";

export const loadJobsList = (p?: any) => service.getJobsList(p);
export const loadJob = (id: any) => service.getJob(id);
export const saveJob = (d: any) => service.saveJob(d);
export const removeJob = (id: any) => service.removeJob(id);