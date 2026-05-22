import * as service from "./services.js";

export const loadDistrictsList = (p?: any) => service.getDistrictsList(p);
export const loadDistrictsMeta = () => service.getDistrictsMeta();
export const loadDistrictsSidebar = () => service.getDistrictsSidebar();
export const saveDistricts = (d: any) => service.saveDistricts(d);
export const removeDistricts = (id: any) => service.removeDistricts(id);