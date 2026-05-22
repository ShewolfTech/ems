// frontend/src/hooks/useResourcePermissions.ts
import { useAuthContext, PermissionItem } from "@/app/providers/AuthContext.js";
import { normalizePermissions } from "@/app/utils/permissions.js";
import { permissionRegistry } from "@shared/registries/permissions/permissionRegistry.js";

// Give the registry a flexible type so TS allows dynamic indexing
type PermissionRegistry = Record<string, Record<string, string[]>>;

// Assert the auto-generated registry conforms to this type
const typedRegistry = permissionRegistry as PermissionRegistry;

/**
 * Hook to get all permissions for a given module + resource.
 * Returns a map of { actionCode: boolean } where each action
 * is true if the user has that permission.
 */
export function useResourcePermissions(module: string, resource: string) {
  const { school } = useAuthContext();

  // FIX: Ensure the property name matches your PermissionItem definition
  // If your AuthContext defines it as 'permission', use p.permission
  const userPermissions: string[] = normalizePermissions(
    (school?.permissions_meta as any[])?.map(
      (p) => p.permissionCode || p.code || p.permission // Fallbacks for safety
    )
  );

  // Safe dynamic indexing
  const actions: string[] = typedRegistry[module]?.[resource] || [];

  // Build a map of { action: boolean }
  return actions.reduce<Record<string, boolean>>((acc, action) => {
    acc[action] = userPermissions.includes(action);
    return acc;
  }, {});
}
