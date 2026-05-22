import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
// Targeted path: C:\Bright\ems\frontend\src\domains\auth\hooks\usePermissions.ts
const HOOKS_DIR = path.join(projectRoot, "frontend/src/domains/auth/hooks");

const content = `
import { useAuth } from '../../../app/providers/AuthContext.js';

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
  const hasPermission = (permission: string) => userPermissions.includes(permission);

  /**
   * Check if user has ANY of the provided permissions: 
   * hasAnyPermission(['admin.all', 'academics.edit'])
   */
  const hasAnyPermission = (perms: string[]) => 
    perms.some(p => userPermissions.includes(p));

  return { 
    permissions: userPermissions, 
    hasPermission, 
    hasAnyPermission 
  };
};
`;

async function run() {
  try {
    await fs.mkdir(HOOKS_DIR, { recursive: true });
    await fs.writeFile(path.join(HOOKS_DIR, "usePermissions.ts"), content.trim());

    console.log("--------------------------------------------------");
    console.log("✅ Hook: usePermissions.ts generated in domains/auth/hooks/");
    console.log("✅ Feature: Permission gating logic synchronized.");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to generate usePermissions hook:", error);
  }
}

run();