// scripts/genLoginForm.ts
import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const COMPONENTS_DIR = path.join(projectRoot, "frontend/src/domains/auth/components");

const content = `
import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin.js';

interface Props {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState<number>(1);

  const { login, isLoading, error } = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await login({ identifier, password, schoolId });
    if (result.success) {
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        required
        placeholder="Email or Username"
        autoComplete="username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <input
        type="password"
        required
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        required
        placeholder="School ID"
        value={schoolId}
        onChange={(e) => setSchoolId(Number(e.target.value))}
        className="w-full p-2 border rounded"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {isLoading ? 'Authenticating...' : 'Login'}
      </button>
    </form>
  );
};

// FIXED: Added default export to resolve TS2613 in imports
export default LoginForm;
`;

async function run() {
  try {
    await fs.mkdir(COMPONENTS_DIR, { recursive: true });
    await fs.writeFile(path.join(COMPONENTS_DIR, "LoginForm.tsx"), content.trim());
    console.log("--------------------------------------------------");
    console.log("✅ FIXED: LoginForm.tsx created with DEFAULT EXPORT");
    console.log("✅ Updated: Uses useLogin hook instead of raw fetch");
    console.log("✅ Result: Centralized login logic, no duplicate network calls");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("❌ Failed to generate LoginForm.tsx:", err);
  }
}

run();
