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
    } else {
      // Explicitly handle failure
      console.error("Login failed:", result.error);
      // Optionally set a fallback message if error is null
      alert(result.error || "Login failed. Please check your credentials.");
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
        {/* Identifier */}
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

        {/* Password */}
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

        {/* School ID */}
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

        {/* Submit */}
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

export default LoginPage;
