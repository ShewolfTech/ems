import { useAuth } from "../../../app/providers/AuthContext.js";

/**
 * usePermissions Hook
 * A domain-specific gatekeeper that checks the user's permission array.
 * Uses the dot-notation standard: 'module.resource.action'
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  /**
   * Check for a single permission: hasPermission('academics.classes.view')
   */
  const hasPermission = (permission: string) =>
    userPermissions.includes(permission);

  /**
   * Check if user has ANY of the provided permissions:
   * hasAnyPermission(['admin.all', 'academics.edit'])
   */
  const hasAnyPermission = (perms: string[]) =>
    perms.some((p) => userPermissions.includes(p));

  return {
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
  };
};
