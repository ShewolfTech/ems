// Path: src/utils/enrichUserMetadata.ts
import type { User } from "@supabase/supabase-js";

/**
 * ExtendedUser type wraps the Supabase User and adds safe metadata + permissions.
 */
export interface ExtendedUser {
  base: User; // the original Supabase user
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  permissions?: string[];
}

/**
 * Frontend enrichUserMetadata
 * Ensures user_metadata exists and provides safe defaults.
 */
export function enrichUserMetadata(user: User | null): ExtendedUser | null {
  if (!user) return null;

  return {
    base: user,
    user_metadata: {
      full_name: (user as any)?.user_metadata?.full_name ?? "Teacher",
      ...(user as any)?.user_metadata,
    },
    permissions: (user as any)?.permissions ?? [],
  };
}
