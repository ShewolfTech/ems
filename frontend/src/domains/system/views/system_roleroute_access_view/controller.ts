import * as service from "./services.js";

export const loadSystemRolerouteAccessViewList = (p?: any) => service.getSystemRolerouteAccessViewList(p);
export const loadSystemRolerouteAccessViewMeta = () => service.getSystemRolerouteAccessViewMeta();
export const loadSystemRolerouteAccessViewSidebar = () => service.getSystemRolerouteAccessViewSidebar();
export const saveSystemRolerouteAccessView = (d: any) => service.saveSystemRolerouteAccessView(d);
export const removeSystemRolerouteAccessView = (id: any) => service.removeSystemRolerouteAccessView(id);