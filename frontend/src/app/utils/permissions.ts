// frontend/src/app/utils/permissions.ts
import { ComponentRegistry } from "@/app/routes/RouteRegistry.js";

export interface ResourceCapabilities {
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasRead: boolean;
  hasPage: boolean;
}

/**
 * Normalize permissions so they always stay in the format:
 *   module.resource.action
 * Example: "studentsmgt.students.read"
 */
export function normalizePermissions(userPermissions?: string[]): string[] {
  if (!Array.isArray(userPermissions)) return [];

  return userPermissions
    .map((p) => {
      if (!p) return null;

      // Split by dot or colon
      const parts = p.split(/[.:]/);

      // Handle both "module.resource.action" (3 parts) and "resource.action" (2 parts)
      if (parts.length === 3) {
        const [module, resource, action] = parts;
        return `${module}.${resource}.${action}`.toLowerCase();
      } else if (parts.length === 2) {
        const [resource, action] = parts;
        return `${resource}.${action}`.toLowerCase();
      }

      return p.toLowerCase();
    })
    .filter(Boolean) as string[];
}

/**
 * Build capabilities map keyed by resource, with flags for CRUD actions.
 */
export function buildCapabilities(userPermissions?: string[]): Record<string, ResourceCapabilities> {
  const caps: Record<string, ResourceCapabilities> = {};
  if (!Array.isArray(userPermissions)) return caps;

  for (const perm of userPermissions) {
    if (!perm) continue;

    const parts = perm.split(/[.:]/);
    const action = parts[parts.length - 1].toLowerCase();
    const resource = parts.length >= 3 ? parts[1].toLowerCase() : parts[0].toLowerCase();

    if (!caps[resource]) {
      caps[resource] = {
        hasCreate: false,
        hasUpdate: false,
        hasDelete: false,
        hasRead: false,
        hasPage: true,
      };
    }

    if (action === "manage" || action === "admin") {
      Object.assign(caps[resource], {
        hasRead: true,
        hasCreate: true,
        hasUpdate: true,
        hasDelete: true,
      });
    } else if (action === "read" || action === "view") {
      caps[resource].hasRead = true;
    } else if (action === "create") {
      caps[resource].hasCreate = true;
    } else if (action === "update") {
      caps[resource].hasUpdate = true;
    } else if (action === "delete") {
      caps[resource].hasDelete = true;
    }

    // Direct string mapping for RequirePermission component
    caps[`${resource}.${action}`] = caps[resource];
  }

  return caps;
}
