import * as service from "./services.js";

export const loadStreamsList = (p?: any) => service.getStreamsList(p);
export const saveStreams = (d: any) => service.saveStreams(d);
export const removeStreams = (id: any) => service.removeStreams(id);
