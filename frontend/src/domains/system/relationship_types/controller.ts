import * as service from "./services.js";

export const loadRelationshipTypesList = (p?: any) => service.getRelationshipTypesList(p);
export const loadRelationshipTypesMeta = () => service.getRelationshipTypesMeta();
export const loadRelationshipTypesSidebar = () => service.getRelationshipTypesSidebar();
export const saveRelationshipTypes = (d: any) => service.saveRelationshipTypes(d);
export const removeRelationshipTypes = (id: any) => service.removeRelationshipTypes(id);