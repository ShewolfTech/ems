import * as service from "./services.js";

export const loadRoutePermissionsList = (p?: any) => service.getRoutePermissionsList(p);
export const loadRoutePermissionsMeta = () => service.getRoutePermissionsMeta();
export const loadRoutePermissionsSidebar = () => service.getRoutePermissionsSidebar();
export const saveRoutePermissions = (d: any) => service.saveRoutePermissions(d);
export const removeRoutePermissions = (id: any) => service.removeRoutePermissions(id);