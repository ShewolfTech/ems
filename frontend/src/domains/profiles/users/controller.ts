import * as service from "./services.js";

export const loadUsersList = (p?: any) => service.getUsersList(p);
export const loadUsersMeta = () => service.getUsersMeta();
export const loadUsersSidebar = () => service.getUsersSidebar();
export const saveUsers = (d: any) => service.saveUsers(d);
export const removeUsers = (id: any) => service.removeUsers(id);