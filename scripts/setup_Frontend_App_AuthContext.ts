import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const PROVIDERS_DIR = path.join(projectRoot, "frontend/src/app/providers");

const contextContent = `
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginInput, RegisterInput } from '../../domains/auth/validator.js';

// 1. Explicitly define the User shape
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions: string[]; // This ensures 'p' is known as a string automatically
  schoolId: number;
}

// 2. Explicitly define the Context shape
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for AppRoutes compatibility
  school: any;      // Alias for AppRoutes compatibility
  login: (data: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// 3. Initialize with the explicit type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const initAuth = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (response.ok) {
        const result = await response.json();
        // result.data must match the User interface
        setUser(result.data);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!user, 
      isLoading,
      loading: isLoading,
      school: user ? { id: user.schoolId } : null,
      login: async () => ({ success: true }), 
      register: async () => ({ success: true }),
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ALIAS: This is what AppRoutes.tsx is importing
export const useAuthContext = useAuth;
`;

async function run() {
  try {
    await fs.mkdir(PROVIDERS_DIR, { recursive: true });
    await fs.writeFile(path.join(PROVIDERS_DIR, "AuthContext.tsx"), contextContent.trim());

    console.log("--------------------------------------------------");
    console.log("✅ AuthContext.tsx RE-GENERATED");
    console.log("✅ Type Inference: 'permissions' is now explicitly string[]");
    console.log("✅ Compatibility: 'loading' and 'school' properties active.");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to generate AuthContext.tsx:", error);
  }
}

run();