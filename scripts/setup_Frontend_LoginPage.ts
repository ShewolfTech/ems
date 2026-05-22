import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const PAGES_DIR = path.join(projectRoot, "frontend/src/domains/auth/pages");

const content = `
import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin.js';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState<number>(1);
  
  const { login, isLoading, error } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ identifier, password, schoolId });
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1e40af' }}>EMS Portal</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Secure Institution Login</p>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', border: '1px solid #fee2e2' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Email or Username</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder="Enter your credentials"
            autoComplete="username"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>School ID</label>
          <input
            type="number"
            value={schoolId}
            onChange={(e) => setSchoolId(Number(e.target.value))}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

// FIXED: Added default export to resolve TS2613 in AppRoutes
export default LoginPage;
`;

async function run() {
  try {
    await fs.mkdir(PAGES_DIR, { recursive: true });
    await fs.writeFile(path.join(PAGES_DIR, "LoginPage.tsx"), content.trim());
    console.log("--------------------------------------------------");
    console.log("✅ FIXED: LoginPage.tsx now has a DEFAULT EXPORT");
    console.log("✅ Result: AppRoutes.tsx should now recognize the import.");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("❌ Failed to update LoginPage:", err);
  }
}
run();