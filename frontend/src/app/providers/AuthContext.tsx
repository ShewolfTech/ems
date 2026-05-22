// frontend/src/app/providers/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  normalizePermissions,
  buildCapabilities,
  ResourceCapabilities,
} from "../utils/permissions.js";
import { authService } from "@/domains/auth/services/authService.js";

/**
 * INTERFACES
 */
export interface PermissionItem {
  module: string;
  route: string;
  displayName: string;
  fullCode: string;
  resource: string;
  icon?: string;
  display_order?: number;
  is_menu_item: boolean | string | number;
  group_name?: string;  // for sidebar sub-grouping
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: number;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolLogo?: string;
  schoolCode: string;
  permissions: string[]; // Raw strings from DB: e.g. "academic_years.manage"
  permissions_meta: PermissionItem[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  school: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo_url?: string;
    code: string;
    permissions_meta: PermissionItem[];
    menuItems: PermissionItem[];
  } | null;
  permissions: string[];
  capabilities: Record<string, ResourceCapabilities>;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (credentials: any) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = "http://127.0.0.1:4000/api/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

const logout = useCallback(() => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token"); // Remove both just in case
  setToken(null);
  setUser(null);
  setIsLoading(false);
  // 🛡️ Force a redirect to login if not already there
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}, []);

const initAuth = useCallback(async () => {
  const currentToken = localStorage.getItem("auth_token");
  if (!currentToken) {
    setIsLoading(false);
    return;
  }

try {
    const response = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    
    const result = await response.json();

    // 🛡️ Strict check: If the user is missing from DB, result.success will be false
    if (response.ok && result.success && result.data) {
      setUser(result.data);
    } else {
      console.warn("🛡️ Invalid session detected during init. Logging out.");
      logout(); 
    }
  } catch (err) {
    logout();
  } finally {
    setIsLoading(false);
  }
}, [logout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: any) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();

      if (response.ok && result.data?.token) {
        // 🛡️ Ensure we save as "auth_token" to match api.ts
        localStorage.setItem("auth_token", result.data.token);
        setToken(result.data.token);
        setUser(result.data.user); // Backend must return user object here
        return { success: true };
      }
      return { success: false, error: result.message || "Login failed" };
    } catch (err) {
      return { success: false, error: "Connection error" };
    }
  };

  const register = async (credentials: any) => {
    try {
      // Calling the backend service we just finished
      const result = await authService.register(credentials);

      if (result.success && result.data?.token) {
        localStorage.setItem("auth_token", result.data.token);
        setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: result.error || "Registration failed",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || "Connection error",
      };
    }
  };

  /**
   * MEMOIZED AUTH DATA
   * This block prevents the "Forced Reflow" lag by ensuring derived data
   * only changes when the 'user' object reference actually updates.
   */
  const authMemo = useMemo(() => {
    if (!user) {
      return {
        flattenedPermissions: [],
        capabilities: {},
        menuItems: [],
        schoolData: null,
      };
    }

    const raw = user.permissions || [];
    const meta = user.permissions_meta || [];

    // Filter and Sort Sidebar items
    const menu = meta
      .filter((p) => {
        const val = String(p.is_menu_item).toLowerCase();
        return val === "true" || val === "1";
      })
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    // Build functional capabilities for AppRoutes and Page logic
    const caps = buildCapabilities(raw);

    // Build the clean school object
    const school = {
      id: user.schoolId,
      name: user.schoolName,
      address: user.schoolAddress,
      phone: user.schoolPhone,
      email: user.schoolEmail,
      logo_url: user.schoolLogo,
      code: user.schoolCode,
      permissions_meta: meta,
      menuItems: menu,
    };

    return {
      flattenedPermissions: normalizePermissions(raw),
      capabilities: caps,
      menuItems: menu,
      schoolData: school,
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        school: authMemo.schoolData,
        permissions: authMemo.flattenedPermissions,
        capabilities: authMemo.capabilities,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const useAuth = useAuthContext;
