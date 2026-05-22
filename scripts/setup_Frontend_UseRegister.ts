import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const HOOKS_DIR = path.join(projectRoot, "frontend/src/domains/auth/hooks");

const content = `
import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthContext.js';
import { RegisterInput } from '../validator.js';

export const useRegister = () => {
  const { register: contextRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Constants for your requested dropdowns
  const options = {
    genders: ['Male', 'Female', 'Other'],
    statuses: ['Active', 'Inactive', 'Pending'],
    classes: ['Grade 1', 'Grade 2', 'Grade 3', 'SS1', 'SS2', 'SS3'] // Customize as needed
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await contextRegister(data);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, options };
};
`;

async function run() {
  await fs.mkdir(HOOKS_DIR, { recursive: true });
  await fs.writeFile(path.join(HOOKS_DIR, "useRegister.ts"), content.trim());
  console.log("✅ Hook: useRegister.ts generated (with Dropdown options).");
}
run();