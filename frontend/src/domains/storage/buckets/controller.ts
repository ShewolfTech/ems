import * as service from "./services.js";

export const loadBucketsList = (p?: any) => service.getBucketsList(p);
export const loadBucketsMeta = () => service.getBucketsMeta();
export const loadBucketsSidebar = () => service.getBucketsSidebar();
export const saveBuckets = (d: any) => service.saveBuckets(d);
export const removeBuckets = (id: any) => service.removeBuckets(id);