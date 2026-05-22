

// ===== frontend\src\components\domains\aacommon\Button.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\Button.tsx

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  ...props
}) => {
  const base = "px-4 py-2 rounded font-medium focus:outline-none";
  const styles: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};


export default Button;




// ===== frontend\src\components\domains\aacommon\FormField.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\FormField.tsx

import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, error }) => (
  <div className="form-field">
    <label className="form-label">{label}</label>
    {children}
    {error && <span className="form-error">{error}</span>}
  </div>
);


export default FormField;




// ===== frontend\src\components\domains\aacommon\index.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\index.ts

export { default as Button } from "./Button.js";
export { default as FormField } from "./FormField.js";
export { default as Input } from "./Input.js";
export { default as Loader } from "./Loader.js";
export { default as Modal } from "./Modal.js";
export * from "./normalizeForm.js";
export { default as RequirePermission } from "./RequirePermission.js";
export * from "./StaticSelects.js";
export { default as Table } from "./Table.js";
export { default as Toast } from "./Toast.js";




// ===== frontend\src\components\domains\aacommon\Input.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\Input.tsx

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => (
  <div className="flex flex-col w-full gap-1.5">
    {label && (
      <label className="text-sm font-bold text-slate-700 tracking-tight ml-1">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-3 
        bg-slate-50 border border-slate-200 
        rounded-xl text-sm font-semibold text-slate-900
        placeholder:text-slate-400 placeholder:font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
        disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
        ${error ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
        ${className}
      `}
      {...props}
    />
    {error && (
      <span className="text-[11px] font-bold text-red-600 ml-1 animate-in fade-in slide-in-from-top-1">
        {error}
      </span>
    )}
  </div>
);

export default Input;




// ===== frontend\src\components\domains\aacommon\Loader.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\Loader.tsx

import React from "react";

interface LoaderProps {
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({ size = 40 }) => (
  <div className="flex items-center justify-center">
    <svg
      className="animate-spin text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  </div>
);


export default Loader;




// ===== frontend\src\components\domains\aacommon\Modal.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\Modal.tsx

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg w-96 p-4">
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default Modal;




// ===== frontend\src\components\domains\aacommon\normalizeForm.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\normalizeForm.ts

// frontend/src/components/domains/aacommon/normalizeForm.ts
export function normalizeForm<T>(
  formValues: Record<string, any>,
  formFields: string[],
  context: { schoolId: number; userId: number }
): T {
  const payload: any = {};

  for (const key of formFields) {
    const value = formValues[key];

    if (value === undefined || value === null) {
      payload[key] = undefined;
      continue;
    }

    if (typeof value === "string" && /^\d+$/.test(value)) {
      payload[key] = Number(value); // numeric strings → number
    } else if (key.toLowerCase().includes("date")) {
      payload[key] = value instanceof Date ? value : new Date(value); // date fields
    } else if (key.toLowerCase().startsWith("is")) {
      payload[key] = Boolean(value); // boolean flags
    } else {
      payload[key] = value;
    }
  }

  // System defaults
  payload.schoolId = context.schoolId;
  payload.createdBy = context.userId;
  payload.updatedBy = context.userId;
  payload.createdAt = new Date();
  payload.updatedAt = new Date();
  payload.isActive = true;
  payload.isDeleted = false;

  return payload as T;
}




// ===== frontend\src\components\domains\aacommon\RequirePermission.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\RequirePermission.tsx

import React from "react";

interface RequirePermissionProps {
  permission: string;    // e.g., "students.read"
  permissions: string[]; // e.g., ["studentsmgt.students.read", "studentsmgt.enrollments.manage"]
  children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  permissions,
  children,
}) => {
  if (!permissions || !Array.isArray(permissions)) return null;

  // Split the requested permission into resource + action
  const parts = permission.split(/[.:]/);
  const resource = parts.length > 1 ? parts[parts.length - 2].toLowerCase() : parts[0].toLowerCase();
  const action = parts[parts.length - 1].toLowerCase();

  const hasAccess = permissions.some((p) => {
    const pParts = p.split(/[.:]/);
    const pResource = pParts.length >= 3 ? pParts[1].toLowerCase() : pParts[0].toLowerCase();
    const pAction = pParts[pParts.length - 1].toLowerCase();

    // Match exact resource+action OR master manage/admin keys
    return (
      (pResource === resource && pAction === action) ||
      (pResource === resource && (pAction === "manage" || pAction === "admin"))
    );
  });

  return hasAccess ? <>{children}</> : null;
};

export default RequirePermission;




// ===== frontend\src\components\domains\aacommon\StaticSelects.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\StaticSelects.tsx

import React from "react";

interface StaticSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}

export const StaticSelect: React.FC<StaticSelectProps> = ({ options, value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

// Example presets
export const YesNoSelect = (props: Omit<StaticSelectProps, "options">) =>
  <StaticSelect {...props} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />;




// ===== frontend\src\components\domains\aacommon\Table.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\Table.tsx

// frontend/src/components/domains/aacommon/Table.tsx
import React from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
}

// frontend/src/components/domains/aacommon/Table.tsx

export function Table<T extends Record<string, any>>({ columns, data, loading }: TableProps<T>) {
  if (loading) return <div className="p-12 text-center text-slate-400 animate-pulse">Loading records...</div>;

  // 🛡️ Guard: Ensure data is an array before trying to access .length or .map
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 italic">No records available.</td>
            </tr>
          ) : (
            safeData.map((row, i) => (
              <tr key={row.id || i} className="group hover:bg-slate-50/80 transition-colors cursor-pointer">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-600">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;




// ===== frontend\src\components\domains\aacommon\Toast.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\aacommon\Toast.tsx

import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number; // auto-close after ms
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles: Record<ToastType, string> = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${styles[type]}`}
    >
      {message}
    </div>
  );
};


export default Toast;




// ===== backend\src\domains\auth\enrichUserMetadata.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\auth\enrichUserMetadata.ts

import { db } from "../../config/infra/database.js";
import { sql } from "kysely";
import { UserMetadataEnrichment, PermissionsMetaRow } from "./types.js";

/**
 * Enriches user data with school details and granular permissions.
 */
export async function enrichUserMetadata(
  email: string,
  schoolId: number,
  userId: string | number,
): Promise<UserMetadataEnrichment> {
  try {
    // 1. Fetch school info with explicit casting to satisfy UserMetadataEnrichment['school']
    const school = await db
      .selectFrom("schools")
      .select([
        "name",
        "code",
        "address",
        "contact_phone as phone",
        "contact_email as email",
        "logo_url as logo",
      ] as any)
      .where("id", "=", schoolId as any)
      .executeTakeFirst() as UserMetadataEnrichment['school']; // <--- ADD THIS CAST HERE

    // 2. Fetch permissions mapping route_permissions via permission_key string
    const permissionsData = await sql<PermissionsMetaRow>`
        SELECT 
            p.module, 
            p.resource,
            p.action,
            p.permission_key AS "fullCode",
            rp.route, 
            rp.display_name AS "displayName",
            rp.icon, 
            rp.is_menu_item, 
            rp.display_order,
            p.module AS "moduleName"
        FROM public.user_permissions up
        INNER JOIN public.permissions p ON p.id = up.permission_id
        LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
        WHERE up.user_id = ${Number(userId)} 
          AND up.school_id = ${schoolId}
          AND up.is_allowed = true
          AND up.is_active = true
          AND p.is_deleted = false
          AND p.is_active = true
        ORDER BY p.module, rp.display_order ASC
      `.execute(db);

    const rows = permissionsData.rows || [];

    return {
      success: true,
      school: school || null,
      permissions: [...new Set(rows.map((p) => p.fullCode))],
      permissions_meta: rows,
    };
  } catch (error) {
    console.error(`[ENRICHMENT_ERROR] User: ${userId}:`, error);
    
    return { 
      success: false, 
      school: null, 
      permissions: [], 
      permissions_meta: [] 
    };
  }
}




// ===== frontend\src\app\providers\AuthContext.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\app\providers\AuthContext.tsx

// frontend/src/app/providers/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { normalizePermissions, buildCapabilities, ResourceCapabilities } from "../utils/permissions.js";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
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

      if (response.ok && result.success) {
        setUser(result.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Auth initialization failed:", err);
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
        localStorage.setItem("auth_token", result.data.token);
        setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      }
      return { success: false, error: result.error || "Login failed" };
    } catch {
      return { success: false, error: "Connection error" };
    }
  };

  const register = async (credentials: any) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();

      if (response.ok && result.data?.token) {
        localStorage.setItem("auth_token", result.data.token);
        setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      }
      return { success: false, error: result.error || "Registration failed" };
    } catch {
      return { success: false, error: "Connection error" };
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




// ===== frontend\src\domains\studentsmgt\enrollments\controller.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\controller.ts

// Auto-generated permissions-aware controller for Enrollments
import { EnrollmentsSchema } from "./validator.js";
import * as service from "./services.js";
import type { Enrollments, CreateEnrollments, UpdateEnrollments } from "./types.js";
import { EnrollmentsValidationError, EnrollmentsServiceError } from "./errors.js";


export async function loadEnrollmentsList(userPermissions: string[], params?: any): Promise<Enrollments[]> {
  if (!userPermissions.includes("enrollments.read") && !userPermissions.includes("enrollments.manage")) {
    throw new EnrollmentsServiceError("Permission denied: enrollments.read");
  }
  try {
    return (await service.getEnrollmentsList(params)).data;
  } catch {
    throw new EnrollmentsServiceError("Failed to load Enrollments list");
  }
}

export async function loadEnrollments(userPermissions: string[], id: number | string): Promise<Enrollments> {
  if (!userPermissions.includes("enrollments.read") && !userPermissions.includes("enrollments.manage")) {
    throw new EnrollmentsServiceError("Permission denied: enrollments.read");
  }
  try {
    return (await service.getEnrollmentsById(id)).data;
  } catch {
    throw new EnrollmentsServiceError(`Failed to load Enrollments with ID ${id}`);
  }
}

export async function createEnrollments(userPermissions: string[], data: unknown): Promise<Enrollments> {
  if (!userPermissions.includes("enrollments.create") && !userPermissions.includes("enrollments.manage")) {
    throw new EnrollmentsServiceError("Permission denied: enrollments.create");
  }
  const parsed = EnrollmentsSchema.safeParse(data);
  if (!parsed.success) throw new EnrollmentsValidationError(parsed.error.message);
  try {
    return (await service.createEnrollments(parsed.data as unknown as CreateEnrollments)).data;
  } catch {
    throw new EnrollmentsServiceError("Failed to create Enrollments");
  }
}

export async function updateEnrollments(userPermissions: string[], id: number | string, data: unknown): Promise<Enrollments> {
  if (!userPermissions.includes("enrollments.update") && !userPermissions.includes("enrollments.manage")) {
    throw new EnrollmentsServiceError("Permission denied: enrollments.update");
  }
  const parsed = EnrollmentsSchema.partial().safeParse(data);
  if (!parsed.success) throw new EnrollmentsValidationError(parsed.error.message);
  try {
    return (await service.updateEnrollments(id, parsed.data as unknown as UpdateEnrollments)).data;
  } catch {
    throw new EnrollmentsServiceError(`Failed to update Enrollments with ID ${id}`);
  }
}

export async function deleteEnrollments(userPermissions: string[], id: number | string): Promise<void> {
  if (!userPermissions.includes("enrollments.delete") && !userPermissions.includes("enrollments.manage")) {
    throw new EnrollmentsServiceError("Permission denied: enrollments.delete");
  }
  try {
    await service.deleteEnrollments(id);
  } catch {
    throw new EnrollmentsServiceError(`Failed to delete Enrollments with ID ${id}`);
  }
}




// ===== frontend\src\domains\studentsmgt\enrollments\errors.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\errors.ts

/**
 * Auto-generated error classes for Enrollments
 */

export class EnrollmentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnrollmentsValidationError);
    }
  }
}

export class EnrollmentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnrollmentsServiceError);
    }
  }
}




// ===== frontend\src\domains\studentsmgt\enrollments\hooks\index.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\hooks\index.ts

export * from "./useEnrollments.js";




// ===== frontend\src\domains\studentsmgt\enrollments\hooks\useEnrollments.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\hooks\useEnrollments.ts

/**
 * Hook for Enrollments
 * Generated for Permissions-Aware Architecture.
 * Reflects PermissionRegistry truth for enrollments.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { loadEnrollmentsList, loadEnrollments, createEnrollments, updateEnrollments } from "../controller.js";
import type { Enrollments, CreateEnrollments, UpdateEnrollments } from "../types.js";

interface UseEnrollmentsOptions {
  autoFetch?: boolean;
  filters?: any;
  permissions: string[];
}

export function useEnrollments(options: UseEnrollmentsOptions) {
  const [data, setData] = useState<Enrollments[]>([]);
  const [selectedItem, setSelectedItem] = useState<Enrollments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const reload = useCallback(async (params?: any) => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await loadEnrollmentsList(options.permissions, params || options.filters);
      if (isMounted.current) setData(result);
    } catch (err: any) {
      if (isMounted.current) setError(err.message || "Failed to load Enrollments");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [options.permissions, JSON.stringify(options.filters)]);

  const find = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const result = await loadEnrollments(options.permissions, id);
      if (isMounted.current) setSelectedItem(result);
      return result;
    } catch (err: any) {
      if (isMounted.current) setError(err.message);
      return null;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [options.permissions]);

  useEffect(() => {
    if (options.autoFetch) {
      reload();
    }
  }, [reload, options.autoFetch]);

  
  const save = async (payload: unknown) => {
    setLoading(true);
    try {
      const result = await createEnrollments(options.permissions, payload);
      await reload();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
  const update = async (id: string | number, payload: unknown) => {
    setLoading(true);
    try {
      const result = await updateEnrollments(options.permissions, id, payload);
      await reload();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
  const remove = async (id: string | number) => {
    setLoading(true);
    try {
      // Delete logic would go here if controller exports it
      await reload();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    selectedItem,
    loading,
    error,
    reload,
    find,
    save,
    update,
    remove,
  };
}




// ===== frontend\src\domains\studentsmgt\enrollments\services.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\services.ts

// Auto-generated service layer for Enrollments
import api from "@/utils/api.js";


export async function getEnrollmentsList(params?: any) {
  return api.get("/studentsmgt/enrollments", { params });
}

export async function getEnrollmentsById(id: number | string) {
  return api.get(`/studentsmgt/enrollments/${id}`);
}

export async function createEnrollments(data: any) {
  return api.post("/studentsmgt/enrollments", data);
}

export async function updateEnrollments(id: number | string, data: any) {
  return api.put(`/studentsmgt/enrollments/${id}`, data);
}

export async function deleteEnrollments(id: number | string) {
  return api.delete(`/studentsmgt/enrollments/${id}`);
}




// ===== frontend\src\domains\studentsmgt\enrollments\types.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\types.ts

// Auto-generated types for Enrollments domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S }
  ? S
  : T extends { readonly __brand__: any }
  ? T
  : T;

export type Enrollments = {
  [K in keyof DB["enrollments"]]: Unwrap<DB["enrollments"][K]>;
};

export type CreateEnrollments = Omit<Enrollments, "id" | "schoolId" | "school_id" | "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | "created_by" | "updated_by" | "deleted_by" | "is_deleted" | "isDeleted">;
export type UpdateEnrollments = Partial<CreateEnrollments>;

export type EnrollmentsPayload = {
  academicYearId: Enrollments["academicYearId"];
  enrollmentDate: Enrollments["enrollmentDate"];
  gradeLevelId: Enrollments["gradeLevelId"];
  isActive: Enrollments["isActive"];
  studentId: Enrollments["studentId"];
  termId: Enrollments["termId"];
};

export type EnrollmentsInitialValues = {
  academicYearId: Enrollments["academicYearId"];
  enrollmentDate: Enrollments["enrollmentDate"];
  gradeLevelId: Enrollments["gradeLevelId"];
  isActive: Enrollments["isActive"];
  studentId: Enrollments["studentId"];
  termId: Enrollments["termId"];
};

export type EnrollmentsDefaultValues = {
  academicYearId?: Enrollments["academicYearId"];
  enrollmentDate?: Enrollments["enrollmentDate"];
  gradeLevelId?: Enrollments["gradeLevelId"];
  isActive?: Enrollments["isActive"];
  studentId?: Enrollments["studentId"];
  termId?: Enrollments["termId"];
};

export type EnrollmentsFormValues = {
  academicYearId: Enrollments["academicYearId"];
  enrollmentDate: Enrollments["enrollmentDate"];
  gradeLevelId: Enrollments["gradeLevelId"];
  isActive: Enrollments["isActive"];
  studentId: Enrollments["studentId"];
  termId: Enrollments["termId"];
};

export const EnrollmentsMetadata = {
  resource: "enrollments",
  label: "Enrollments",
  fields: [
    { name: "academicYearId", label: "AcademicYearId", uiType: "select", required: true },
    { name: "enrollmentDate", label: "EnrollmentDate", uiType: "date", required: true },
    { name: "gradeLevelId", label: "GradeLevelId", uiType: "select", required: true },
    { name: "isActive", label: "IsActive", uiType: "boolean", required: true },
    { name: "studentId", label: "StudentId", uiType: "select", required: true },
    { name: "termId", label: "TermId", uiType: "select", required: true }
  ]
};




// ===== frontend\src\domains\studentsmgt\enrollments\validator.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\domains\studentsmgt\enrollments\validator.ts

import { z } from "zod";

export const EnrollmentsSchema = z.object({
  academicYearId: z.number(),
  createdAt: z.date().nullable(),
  createdBy: z.number().nullable(),
  deletedAt: z.date().nullable(),
  deletedBy: z.number().nullable(),
  enrollmentDate: z.date().nullable(),
  gradeLevelId: z.number(),
  id: z.number(),
  isActive: z.boolean().nullable(),
  isDeleted: z.boolean().nullable(),
  schoolId: z.number(),
  studentId: z.number(),
  termId: z.number().nullable(),
  updatedAt: z.date().nullable(),
  updatedBy: z.number().nullable(),
});




// ===== backend\src\domains\studentsmgt\enrollments\controller.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\controller.ts

import { Request, Response } from "express";
import { enrollmentsService } from "./service.js";
import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";

export class EnrollmentsController {

  async getAll(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.findAll();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: "Record not found" });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.delete(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.findAll();
      const enriched = data.map((p: any) => ({
        display_name: p.display_name,
        icon: p.icon,
        is_menu_item: p.is_menu_item,
        display_order: p.display_order,
      }));
      res.json({ success: true, permissions_meta: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSidebar(req: Request, res: Response) {
    try {
      const data = await enrollmentsService.findAll();
      const sidebar = data
        .filter((p: any) => p.is_menu_item)
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
      res.json({ success: true, sidebar });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
export const enrollmentsController = new EnrollmentsController();




// ===== backend\src\domains\studentsmgt\enrollments\errors.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\errors.ts

/**
 * Custom Errors for Enrollments
 * Auto-generated domain error classes
 */
export class EnrollmentsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "EnrollmentsError";
  }
}

export class EnrollmentsNotFoundError extends EnrollmentsError {
  constructor(id?: string | number) {
    super("Enrollments record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class EnrollmentsValidationError extends EnrollmentsError {
  constructor(message?: string) {
    super(message || "Enrollments validation failed", 400);
  }
}

export class EnrollmentsUnauthorizedError extends EnrollmentsError {
  constructor() {
    super("Unauthorized to perform this action on Enrollments", 403);
  }
}

export class EnrollmentsConflictError extends EnrollmentsError {
  constructor(message: string = "Enrollments conflict") {
    super(message, 409);
  }
}

export class EnrollmentsForbiddenError extends EnrollmentsError {
  constructor() {
    super("Forbidden: insufficient rights for Enrollments", 403);
  }
}




// ===== backend\src\domains\studentsmgt\enrollments\index.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\index.ts

export * as Controller from "./controller.js";
export * as Errors from "./errors.js";
export * as Routes from "./routes.js";
export * as Service from "./service.js";
export * as Types from "./types.js";
export * as Validator from "./validator.js";




// ===== backend\src\domains\studentsmgt\enrollments\routes.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\routes.ts

/**
 * ⚠️ Auto-generated routes for Enrollments
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { enrollmentsController } from "./controller.js";

const router = Router();

// Standard CRUD Endpoints
router.get("/", enrollmentsController.getAll.bind(enrollmentsController));
router.get("/:id", enrollmentsController.getById.bind(enrollmentsController));
router.post("/", enrollmentsController.create.bind(enrollmentsController));
router.put("/:id", enrollmentsController.update.bind(enrollmentsController));
router.delete("/:id", enrollmentsController.delete.bind(enrollmentsController));

// Metadata for Frontend Menu Rendering
router.get("/permissions-meta", enrollmentsController.getPermissionsMeta.bind(enrollmentsController));
router.get("/sidebar", enrollmentsController.getSidebar.bind(enrollmentsController));

export default router;




// ===== backend\src\domains\studentsmgt\enrollments\service.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\service.ts

// ⚠️ Auto-generated Service for Enrollments
import { db } from "../../../config/infra/database.js";
import { EnrollmentsSchema } from "./validator.js";
import { EnrollmentsType } from "./types.js";

export class EnrollmentsService {

  async findAll() {
    return await db.selectFrom("enrollments" as any).selectAll().execute();
  }

  async findById(id: number | string) {
    return await db.selectFrom("enrollments" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .executeTakeFirst();
  }

  async create(data: EnrollmentsType) {
    const validated = EnrollmentsSchema.parse(data);
    return await db.insertInto("enrollments" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(id: number | string, data: Partial<EnrollmentsType>) {
    return await db.updateTable("enrollments" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: number | string) {
    return await db.updateTable("enrollments" as any)
      .set({ is_active: false } as any)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const enrollmentsService = new EnrollmentsService();




// ===== backend\src\domains\studentsmgt\enrollments\types.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\types.ts

// Auto-generated from kysely.generated.ts
import type { Enrollments } from "@ems/shared/db/kysely.generated.js";

/**
 * Represents the full Enrollments record
 */
export type EnrollmentsType = Enrollments;

/**
 * Represents the data required to create a new Enrollments
 */
export type CreateEnrollmentsInput = Partial<EnrollmentsType>;

/**
 * Represents the data required to update an existing Enrollments
 */
export type UpdateEnrollmentsInput = Partial<EnrollmentsType>;




// ===== backend\src\domains\studentsmgt\enrollments\validator.ts =====
// 📁 Full path: C:\Bright\ems\backend\src\domains\studentsmgt\enrollments\validator.ts

import { z } from "zod";

/**
 * Auto-generated Validator for Enrollments
 */
export const EnrollmentsSchema = z.object({
  academicYearId: z.number(),
  createdAt: z.any().optional(),
  createdBy: z.any().optional(),
  deletedAt: z.any().optional(),
  deletedBy: z.any().optional(),
  enrollmentDate: z.date().optional().nullable(),
  gradeLevelId: z.number(),
  id: z.number().optional(),
  isActive: z.boolean().optional().nullable(),
  isDeleted: z.boolean().optional().nullable(),
  schoolId: z.number(),
  studentId: z.number(),
  termId: z.number().nullable(),
  updatedAt: z.any().optional(),
  updatedBy: z.any().optional(),
}).passthrough();

export type EnrollmentsType = z.infer<typeof EnrollmentsSchema>;




// ===== frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsDetail.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsDetail.tsx

import React from "react";
import { RequirePermission } from "@/components/domains/aacommon/index.js";
import type { Enrollments as EnrollmentsType } from "@/domains/studentsmgt/enrollments/types.js";

export function EnrollmentsDetail({ item, permissions }: { item?: EnrollmentsType, permissions: any }) {
  if (!item) return (
    <div className="p-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
      <p className="text-slate-400 font-medium italic">Select a record to view details</p>
    </div>
  );

  return (
    <RequirePermission permissions={permissions} permission="enrollments.read">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right-2 duration-500">
        <div className="bg-slate-900 p-6 text-white">
           <h3 className="text-lg font-bold tracking-tight">Enrollments Profile</h3>
           <p className="text-slate-400 text-[10px] mt-1 font-bold tracking-widest uppercase">Overview</p>
        </div>
        <div className="p-8 space-y-5">
          
          <div className="group border-b border-slate-50 pb-3 last:border-0 hover:border-teal-100 transition-colors">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AcademicYearId</dt>
            <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
              {typeof (item as any).academicYearId === 'boolean' 
                ? ((item as any).academicYearId ? "Yes" : "No") 
                : String((item as any).academicYearId ?? "—")}
            </dd>
          </div>
          <div className="group border-b border-slate-50 pb-3 last:border-0 hover:border-teal-100 transition-colors">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EnrollmentDate</dt>
            <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
              {typeof (item as any).enrollmentDate === 'boolean' 
                ? ((item as any).enrollmentDate ? "Yes" : "No") 
                : String((item as any).enrollmentDate ?? "—")}
            </dd>
          </div>
          <div className="group border-b border-slate-50 pb-3 last:border-0 hover:border-teal-100 transition-colors">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GradeLevelId</dt>
            <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
              {typeof (item as any).gradeLevelId === 'boolean' 
                ? ((item as any).gradeLevelId ? "Yes" : "No") 
                : String((item as any).gradeLevelId ?? "—")}
            </dd>
          </div>
          <div className="group border-b border-slate-50 pb-3 last:border-0 hover:border-teal-100 transition-colors">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IsActive</dt>
            <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
              {typeof (item as any).isActive === 'boolean' 
                ? ((item as any).isActive ? "Yes" : "No") 
                : String((item as any).isActive ?? "—")}
            </dd>
          </div>
          <div className="group border-b border-slate-50 pb-3 last:border-0 hover:border-teal-100 transition-colors">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">StudentId</dt>
            <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
              {typeof (item as any).studentId === 'boolean' 
                ? ((item as any).studentId ? "Yes" : "No") 
                : String((item as any).studentId ?? "—")}
            </dd>
          </div>
          <div className="group border-b border-slate-50 pb-3 last:border-0 hover:border-teal-100 transition-colors">
            <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TermId</dt>
            <dd className="text-sm font-bold text-slate-900 mt-1 truncate">
              {typeof (item as any).termId === 'boolean' 
                ? ((item as any).termId ? "Yes" : "No") 
                : String((item as any).termId ?? "—")}
            </dd>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}

export default EnrollmentsDetail;




// ===== frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsForm.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsForm.tsx

import React from "react";
import { RequirePermission, Button, Input } from "@/components/domains/aacommon/index.js";
import { EnrollmentsMetadata } from "@/domains/studentsmgt/enrollments/types.js";

export function EnrollmentsForm({ initialData, onClose, onSave, permissions }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    onSave(rawData);
  };

  return (
    <RequirePermission permissions={permissions} permission="enrollments.manage">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        <div className="mb-6">
          <h3 className="font-bold text-2xl text-slate-900 tracking-tight">
            {initialData ? 'Update' : 'Register'} Enrollments
          </h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Fill in the fields below to update the system records.</p>
        </div>

        <form className="grid grid-cols-1 gap-5" onSubmit={handleSubmit}>
          {EnrollmentsMetadata.fields.filter((f: any) => !["id","schoolId","school_id","userId","user_id","createdAt","updatedAt","deletedAt","created_at","updated_at","deleted_at","createdBy","updatedBy","deletedBy","created_by","updated_by","deleted_by","isDeleted","is_deleted"].includes(f.name)).map((meta: any) => {
            const isDate = meta.uiType === "date";
            const isBoolean = meta.uiType === "boolean" || meta.name === "isActive" || meta.name === "is_active";
            const val = initialData?.[meta.name];
            const formattedValue = isDate && val ? new Date(val).toISOString().split('T')[0] : val;

            if (isBoolean) {
              return (
                <div key={meta.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-100 transition-all">
                  <span className="text-sm font-bold text-slate-700">{meta.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name={meta.name} 
                      defaultChecked={val ?? true} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              );
            }

            return (
              <Input 
                key={meta.name}
                label={meta.label}
                name={meta.name}
                type={isDate ? "date" : "text"}
                defaultValue={formattedValue || ''}
                placeholder={`Enter ${meta.label.toLowerCase()}...`}
                className="h-12 rounded-xl border-slate-200 focus:border-teal-600 focus:ring-teal-600/5 transition-all"
              />
            );
          })}
          
          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-50">
            <Button type="button" onClick={onClose} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</Button>
            <Button type="submit" className="bg-teal-600 text-white px-10 rounded-xl font-bold shadow-lg hover:bg-teal-700 active:scale-95 transition-all">
              {initialData ? 'Save Changes' : 'Create Record'}
            </Button>
          </div>
        </form>
      </div>
    </RequirePermission>
  );
}

export default EnrollmentsForm;




// ===== frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsList.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsList.tsx

import React from "react";
import { Table } from "@/components/domains/aacommon/index.js";
import type { Enrollments as EnrollmentsType } from "@/domains/studentsmgt/enrollments/types.js";

export function EnrollmentsList({ data, loading, onSelect }: { data: EnrollmentsType[], loading: boolean, onSelect?: (row: EnrollmentsType) => void }) {
  const columns: any[] = [
    { key: "academicYearId", label: "AcademicYearId" },
    { key: "enrollmentDate", label: "EnrollmentDate" },
    { key: "gradeLevelId", label: "GradeLevelId" },
    { key: "isActive", label: "IsActive" },
    { key: "studentId", label: "StudentId" },
    { key: "termId", label: "TermId" },
    { 
      key: "actions", 
      label: "", 
      render: (_: any, row: EnrollmentsType) => (
        <div className="flex justify-end pr-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect?.(row); }}>
           <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all duration-200 shadow-sm border border-slate-100">
             <span className="text-sm font-bold">→</span>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <Table columns={columns} data={data || []} loading={loading} />
    </div>
  );
}

export default EnrollmentsList;




// ===== frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsPage.tsx =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\studentsmgt\enrollments\EnrollmentsPage.tsx

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { useEnrollments } from "@/domains/studentsmgt/enrollments/hooks/useEnrollments.js";
import { Plus, RefreshCw, ShieldAlert } from "lucide-react";
import { Button, Toast } from "@/components/domains/aacommon/index.js";
import { EnrollmentsList } from "./EnrollmentsList.js";
import { EnrollmentsDetail } from "./EnrollmentsDetail.js";
import EnrollmentsForm from "./EnrollmentsForm.js";
import type { Enrollments as EnrollmentsType } from "@/domains/studentsmgt/enrollments/types.js";
import { EnrollmentsMetadata } from "@/domains/studentsmgt/enrollments/types.js";

export function EnrollmentsPage() {
  const { capabilities, permissions, isLoading, user } = useAuthContext();
  const [selectedItem, setSelectedItem] = useState<EnrollmentsType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const can = capabilities["enrollments"] || { hasRead: false, hasCreate: false };
  const methods = useEnrollments({ permissions: permissions || [], autoFetch: can.hasRead });
  const { data, loading, reload, error } = methods;

  useEffect(() => { if (error) setShowError(true); }, [error]);

  const handlePersistence = async (formData: any) => {
    try {
      const castedData: any = {};
      
      // 1. Process Metadata for Casting
      EnrollmentsMetadata.fields.forEach((meta: any) => {
        let val = formData[meta.name];

        if (val === "" || val === undefined || val === null) {
          castedData[meta.name] = null;
        } else if (meta.uiType === "select" || meta.name.toLowerCase().endsWith("id")) {
          const num = Number(val);
          castedData[meta.name] = isNaN(num) ? val : num;
        } else if (meta.uiType === "date") {
          const dateObj = new Date(val);
          castedData[meta.name] = !isNaN(dateObj.getTime()) ? dateObj : val;
        } else if (meta.uiType === "boolean" || meta.name === "isActive" || meta.name === "is_active") {
          castedData[meta.name] = val === "on" || val === "true" || val === true;
        } else {
          castedData[meta.name] = val;
        }
      });

      // 2. 🛡️ THE STRIPPER LAYER
      // We DELETE these keys entirely so Zod doesn't see 'undefined'
      const keysToStrip = [
        "id", "createdAt", "updatedAt", "deletedAt", 
        "createdBy", "updatedBy", "deletedBy", "isDeleted",
        "created_at", "updated_at", "deleted_at", "created_by", "updated_by", "deleted_by", "is_deleted"
      ];
      
      const finalPayload: any = { ...castedData };
      keysToStrip.forEach(key => {
         delete finalPayload[key];
      });

      // 3. Inject context (Force schoolId to Number)
      finalPayload.schoolId = Number((user as any)?.schoolId || 1);
      
      // Default isActive to true if it's missing (for new records)
      if (finalPayload.isActive === undefined || finalPayload.isActive === null) {
          finalPayload.isActive = true;
      }

      if (selectedItem) {
        await (methods as any).update?.((selectedItem as any).id, finalPayload);
      } else {
        await (methods as any).save?.(finalPayload);
      }

      setIsFormOpen(false);
      setSelectedItem(null);
    } catch (err) { 
      setShowError(true); 
    }
  };

  if (!isLoading && !can.hasRead) return (
    <div className="p-20 text-center flex flex-col items-center">
      <ShieldAlert size={48} className="text-slate-200 mb-4" />
      <h2 className="text-xl font-bold text-slate-400">Access Restricted</h2>
    </div>
  );

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      {showError && error && (
        <Toast 
          type="error" 
          message={typeof error === 'string' ? error : JSON.stringify(error)} 
          onClose={() => setShowError(false)} 
        />
      )}
      
      <header className="flex justify-between items-center border-b pb-8 border-slate-100">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Enrollments</h1>
           <p className="text-slate-400 font-medium text-xs mt-1">Management portal for enrollments records</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => reload()} className="bg-white border border-slate-200 text-slate-400 rounded-xl w-11 h-11 flex items-center justify-center hover:text-teal-600 transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
          {can.hasCreate && (
            <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }} className="bg-slate-900 text-white flex items-center gap-2 px-6 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all text-sm">
              <Plus size={16} /> <span>Add Record</span>
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-7">
          <EnrollmentsList data={data} loading={loading} onSelect={(item) => { setSelectedItem(item); setIsFormOpen(false); }} />
        </div>
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-8">
          {isFormOpen ? (
            <EnrollmentsForm initialData={selectedItem} onClose={() => setIsFormOpen(false)} onSave={handlePersistence} permissions={permissions} />
          ) : (
            <EnrollmentsDetail item={selectedItem || undefined} permissions={permissions} />
          )}
        </div>
      </div>
    </div>
  );
}
export default EnrollmentsPage;




// ===== frontend\src\components\domains\studentsmgt\enrollments\index.ts =====
// 📁 Full path: C:\Bright\ems\frontend\src\components\domains\studentsmgt\enrollments\index.ts

export { default as EnrollmentsDetail } from "./EnrollmentsDetail.js";
export { default as EnrollmentsForm } from "./EnrollmentsForm.js";
export { default as EnrollmentsList } from "./EnrollmentsList.js";
export { default as EnrollmentsPage } from "./EnrollmentsPage.js";

export { default } from "./EnrollmentsPage.js";
