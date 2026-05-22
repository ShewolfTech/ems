// backend/src/types/express.d.ts
import type { SupabaseUser } from "../types/supabase.js";

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseUser & {
        userId?: number;
        role_id?: number;
        schoolId?: number;
        permissions?: string[];
      };
      context?: {
        requestId?: string;
        timestamp?: string;
        userId?: string;
        schoolId?: string | number;
        roles?: string[];
      };
    }
  }
}

export {};
