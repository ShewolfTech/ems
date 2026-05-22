import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
// Targeted path: C:\Bright\ems\frontend\src\domains\auth\hooks\useLogin.ts
const HOOKS_DIR = path.join(projectRoot, "frontend/src/domains/auth/hooks");

const content = `
import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthContext.js';
import { LoginInput } from '../validator.js';

/**
 * useLogin Hook
 * Manages the UI state for the login process (loading, errors).
 * Communicates with the global AuthContext for session management.
 */
export const useLogin = () => {
  const { login: contextLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await contextLogin(data);
      return { success: true };
    } catch (err: any) {
      // Catch backend errors (like InvalidCredentialsError)
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, setError };
};
`;

async function run() {
  try {
    await fs.mkdir(HOOKS_DIR, { recursive: true });
    await fs.writeFile(path.join(HOOKS_DIR, "useLogin.ts"), content.trim());

    console.log("--------------------------------------------------");
    console.log("✅ Hook: useLogin.ts generated in domains/auth/hooks/");
    console.log("✅ Linked to AuthContext and local domain Validator.");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to generate useLogin hook:", error);
  }
}

run();