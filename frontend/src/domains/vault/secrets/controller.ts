import * as service from "./services.js";

export const loadSecretsList = (p?: any) => service.getSecretsList(p);
export const loadSecretsMeta = () => service.getSecretsMeta();
export const loadSecretsSidebar = () => service.getSecretsSidebar();
export const saveSecrets = (d: any) => service.saveSecrets(d);
export const removeSecrets = (id: any) => service.removeSecrets(id);