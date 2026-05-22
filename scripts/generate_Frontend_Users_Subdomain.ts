import * as fs from "fs";
import * as path from "path";

const FRONTEND_PATH = "frontend/src/domains/userspermissionsmgt/users";

const files = {
  // 1. ERRORS: Human-friendly error parsing
  "errors.ts": `
export class UserDomainError extends Error {
  constructor(public message: string, public code?: string, public status?: number) {
    super(message);
    this.name = "UserDomainError";
  }
}

export const handleUserError = (error: any): string => {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  if (status === 409) return "User already exists in this school or identity provider.";
  if (status === 403) return "You do not have permission to manage users.";
  if (status === 400) return \`Validation Failed: \${message}\`;
  
  return message || "An unexpected error occurred in the User service.";
};
  `,

  // 2. TYPES: Domain-specific interfaces
  "types.ts": `
export interface User {
  id: number;
  school_id: number;
  auth_uid: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  first_name: string;
  last_name: string;
  role_id: number | null;
  is_active: boolean;
  nationality: string;
  date_of_birth: string | null;
  created_at: string;
  role_name?: string; 
}

export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'auth_uid'> & {
  password?: string;
};

export type UpdateProfileInput = {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  nationality?: string;
  date_of_birth?: string | null;
};
  `,

  // 3. VALIDATOR: Zod schemas for forms
  "validator.ts": `
import { z } from "zod";

export const UserSchema = z.object({
  username: z.string().min(3, "Username required").toLowerCase().trim(),
  email: z.string().email("Valid email required").toLowerCase().trim(),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  password: z.string().min(6, "Min 6 characters").optional(),
  role_id: z.coerce.number().int().positive("Role required"),
  phone: z.string().nullable().optional(),
  nationality: z.string().default("Ugandan"),
  date_of_birth: z.string().nullable().optional(),
});

export const UpdateProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  nationality: z.string().optional(),
  date_of_birth: z.string().nullable().optional(),
});
  `,

  // 4. SERVICES: API interaction layer
  "services.ts": `
import { api } from "@/services/api.js";
import { User, CreateUserPayload } from "./types.js";

export const usersService = {
  // FIXED: Now accepts schoolId to filter at the API level
  getAll: async (schoolId: number): Promise<User[]> => {
    const { data } = await api.get(\`/profiles/users?schoolId=\${schoolId}\`);
    return data.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post("/profiles/users", payload);
    return data.data;
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await api.put(\`/profiles/users/\${payload.id}\`, payload);
    return data.data;
  }
};
  `,

  // 5. CONTROLLER: Business Logic Layer
  "controller.ts": `
import { usersService } from "./services.js";
import { handleUserError } from "./errors.js";
import { CreateUserInput, UpdateProfileInput } from "./types.js";

export const usersController = {
  async getUsers(schoolId: number) {
    try {
      return await usersService.getAll(schoolId);
    } catch (err: any) {
      throw new Error(handleUserError(err));
    }
  },

  async createStaff(data: CreateUserInput) {
    try {
      return await usersService.create(data);
    } catch (err: any) {
      throw new Error(handleUserError(err));
    }
  },

  async updateProfile(data: UpdateProfileInput) {
    try {
      return await usersService.updateProfile(data);
    } catch (err: any) {
      throw new Error(handleUserError(err));
    }
  }
};
  `,

// 6. HOOKS: The reactive engine
  "hooks/useUsers.ts": `
import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";
import { User } from "../types.js";

export function useUsers({ autoFetch = true, params = {} }: any = {}) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current user from storage
  const authUser = JSON.parse(localStorage.getItem("user") || "{}");
  const activeSchoolId = authUser?.school_id || authUser?.schoolId;

  const reload = useCallback(
    async (p?: any) => {
      if (!activeSchoolId) return;

      setLoading(true);
      try {
        const mergedParams = { ...params, ...p, school_id: activeSchoolId };
        const res = await controller.getUsersList(mergedParams);
        
        // Ensure we handle { success: true, data: [...] } format
        const finalData = res?.data || (Array.isArray(res) ? res : []);
        setData(finalData);
      } catch (err) {
        console.error("Hook Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeSchoolId, JSON.stringify(params)]
  );

  useEffect(() => {
    if (autoFetch) reload();
  }, [autoFetch, reload]);

  return { 
    data, 
    loading, 
    reload, 
    save: (payload: any) => controller.saveUsers({ ...payload, school_id: activeSchoolId }),
    remove: (id: any) => controller.removeUsers(id) 
  };
}
  `
};

async function buildFrontend() {
  const totalFiles = Object.keys(files).length;
  console.log("\n🚀 Starting ESM-Compliant Frontend Synchronization...");
  console.log("---------------------------------------------------------");
  console.log("📂 Path: " + path.resolve(FRONTEND_PATH));
  console.log("📝 Processing " + totalFiles + " domain files with .js extensions...\n");

  let current = 0;

  for (const [fileName, content] of Object.entries(files)) {
    current++;
    const filePath = path.join(FRONTEND_PATH, fileName);
    const dir = path.dirname(filePath);

    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content.trim() + "\n");
      console.log("[" + current + "/" + totalFiles + "] ✅ Generated: " + fileName);
    } catch (err: any) {
      console.error("[" + current + "/" + totalFiles + "] ❌ Failed: " + fileName + " -> " + err.message);
    }
  }

  console.log("\n---------------------------------------------------------");
  console.log("✨ SUCCESS: Frontend logic is now loud, clear, and ESM-ready.");
  console.log("🛠️  All imports now explicitly target .js files.\n");
}

buildFrontend();