
// Auto-generated composite resources
import { permissionRegistry } from "./permissions/permissionRegistry.js";

export const compositeResources: Record<string, string[]> = Object.keys(permissionRegistry).reduce((acc, module) => {
  acc[module] = Object.keys((permissionRegistry as Record<string, any>)[module]);
  return acc;
}, {} as Record<string, string[]>);
