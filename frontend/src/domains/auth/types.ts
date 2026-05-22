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
  schoolId: number;        // ✅ required for school context
  permissions: string[];   // ✅ required for permission checks
}

/**
 * Represents a successful login response from the backend.
 * Includes both token and user object.
 */
export interface LoginResponse {
  success: boolean;
  token: string;           // ✅ add token directly
  user: User;              // ✅ add user object
}

/**
 * Session metadata (used internally for compatibility).
 */
export interface AuthSession {
  token: string;
  userId: string;
  sessionId: string;
}

/**
 * COMPATIBILITY ALIASES
 * Resolves TS2305 errors in existing services/controllers.
 */
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
  permissions: string[];             // Logic checks: ['academics.classes.read']
  permissionsMeta: PermissionsMetaRow[]; // UI Generation
  isAuthenticated: boolean;
  isLoading: boolean;
}
