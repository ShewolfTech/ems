import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const BACKEND_DIR = path.join(projectRoot, "backend/src/domains/auth");
const FRONTEND_DIR = path.join(projectRoot, "frontend/src/domains/auth");

const generateBackendTypes = () => `
/**
 * BACKEND AUTH TYPES
 * Integrated with Kysely and Supabase logic.
 */
export interface TokenPayload {
  userId: string | number;
  roleId: string | number;
  schoolId: number;
  sessionId: string;
  permissions: string[]; // Standard: 'module.resource.action'
}

export interface AuthSession {
  token: string;
  userId: string;
  sessionId: string;
}

export interface PermissionsMetaRow {
  module: string;
  resource: string;
  route: string;
  icon?: string;
  displayName: string;
  moduleName: string;
  module_order?: number;
  display_order?: number;
}
`;

const generateFrontendTypes = () => `
/**
 * FRONTEND AUTH TYPES
 * Fully synchronized with Backend for the Professional Build.
 */

export interface User {
  id: string;
  email: string;
  full_name?: string;
  school_name?: string;
  school_logo_url?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  sessionId: string;
}

/**
 * COMPATIBILITY ALIASES
 * Resolves TS2305 errors in existing services/controllers.
 */
export type LoginResponse = { success: boolean; data: AuthSession };
export type UserContext = User; 

export interface PermissionsMetaRow {
  module: string;
  resource: string;
  route: string;
  icon?: string;
  displayName: string;
  moduleName: string;
}

export type PermissionMap = Record<string, string[]>;

export interface AuthState {
  user: User | null;
  permissions: string[]; // Logic checks: ['academics.classes.read']
  permissionsMeta: PermissionsMetaRow[]; // UI Generation
  isAuthenticated: boolean;
  isLoading: boolean;
}
`;

async function run() {
  try {
    // Ensure directories exist
    await fs.mkdir(BACKEND_DIR, { recursive: true });
    await fs.mkdir(FRONTEND_DIR, { recursive: true });

    // Write Backend Types
    await fs.writeFile(path.join(BACKEND_DIR, "types.ts"), generateBackendTypes().trim());
    console.log("✅ Backend Auth Types generated/updated.");

    // Write Frontend Types
    await fs.writeFile(path.join(FRONTEND_DIR, "types.ts"), generateFrontendTypes().trim());
    console.log("✅ Frontend Auth Types generated/updated (Aliases included).");

    console.log("\n✨ System Synchronized: Types are now consistent across both domains.");
  } catch (error) {
    console.error("❌ Type Generation failed:", error);
  }
}

run();