// frontend/src/domains/auth/context/AuthProvider.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/authApi.js";
import { UserContext } from "../types.js";
import { AuthError } from "../errors.js";

interface AuthContextValue {
  user: UserContext | null;
  token: string | null;
  login: (username: string, password: string, schoolId: number) => Promise<void>;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  schoolId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserContext | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        const result = await authApi.me(savedToken);
        if ("data" in result) {
          setUser(result.data);
        } else {
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string, schoolId: number) => {
    try {
      const result = await authApi.login(username, password, schoolId);

      if ("data" in result) {
        const { token: newToken, user: newUser } = result.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);
        localStorage.setItem("schoolId", String(schoolId));
      } else {
        throw new AuthError(result.error || "Login failed");
      }
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("An unexpected error occurred");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("schoolId");
  };

  const hasPermission = (perm: string) =>
    user?.permissions?.includes(perm) ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        hasPermission,
        schoolId: user?.schoolId ? Number(user.schoolId) : null,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
