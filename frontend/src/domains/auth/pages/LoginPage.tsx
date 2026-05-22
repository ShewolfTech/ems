import React, { useState, useEffect } from "react";
import { useLogin } from "../hooks/useLogin.js";
import { useRegister } from "../hooks/useRegister.js";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService.js";

type AuthView =
  | "LOGIN"
  | "REGISTER_STEP_1"
  | "REGISTER_STEP_2"
  | "FORGOT_PASSWORD"
  | "RESET_PASSWORD";

export const LoginPage: React.FC = () => {
  const [view, setView] = useState<AuthView>("LOGIN");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login, isLoading: isLoginLoading, error: loginError } = useLogin();
  const {
    register,
    isLoading: isRegLoading,
    error: regError,
    options,
  } = useRegister();

  const [formData, setFormData] = useState({
    identifier: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    schoolId: 0,
    gender: "",
    class: "",
  });

  // Detect if user landed here from a reset email
  useEffect(() => {
    if (
      window.location.hash.includes("type=recovery") ||
      location.search.includes("type=recovery")
    ) {
      setView("RESET_PASSWORD");
    }
  }, [location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "schoolId" ? Number(value) : value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      ...formData,
      password: "",
      confirmPassword: "",
      identifier: "",
      email: "",
    });
    setResetSent(false);
    setView("LOGIN");
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({
      identifier: formData.identifier,
      password: formData.password,
      schoolId: formData.schoolId,
    });
    if (result.success) navigate("/dashboard");
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(formData as any);
    if (result.success) navigate("/dashboard");
  };

  const onForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.requestPasswordReset(formData.email);
      setResetSent(true);
    } catch (err) {
      alert("Error sending link.");
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return alert("Passwords don't match");
    try {
      await authService.updatePassword(formData.password);
      alert("Success! Redirecting...");
      navigate("/dashboard");
    } catch (err) {
      alert("Link expired or invalid.");
    }
  };

  const error = loginError || regError;

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "25px",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        fontFamily: "sans-serif",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{ textAlign: "center", color: "#1e40af", marginBottom: "4px" }}
      >
        EMS Portal
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.85rem",
          marginBottom: "20px",
        }}
      >
        {view === "LOGIN" && "Institution Login"}
        {view === "FORGOT_PASSWORD" && "Password Recovery"}
        {view === "RESET_PASSWORD" && "Set New Password"}
        {view.startsWith("REGISTER") && "Create Account"}
      </p>

      {error && (
        <div
          style={{
            color: "#b91c1c",
            background: "#fef2f2",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "0.8rem",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {/* --- LOGIN VIEW --- */}
      {view === "LOGIN" && (
        <form onSubmit={onLogin}>
          <Input
            label="Email or Username"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <div style={{ textAlign: "right", marginTop: "-8px" }}>
            <button
              type="button"
              onClick={() => setView("FORGOT_PASSWORD")}
              style={linkStyle}
            >
              Forgot Password?
            </button>
          </div>
          <Input
            label="School ID"
            name="schoolId"
            type="number"
            value={formData.schoolId}
            onChange={handleChange}
          />
          <Button loading={isLoginLoading}>Sign In</Button>
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button
              type="button"
              onClick={() => setView("REGISTER_STEP_1")}
              style={linkStyle}
            >
              Need an account? Register
            </button>
          </div>
        </form>
      )}

      {/* --- FORGOT PASSWORD VIEW --- */}
      {view === "FORGOT_PASSWORD" && (
        <form onSubmit={onForgotPassword}>
          {resetSent ? (
            <div style={{ textAlign: "center" }}>
              <p>Check your email for instructions.</p>
              <Button onClick={handleCancel}>Back to Login</Button>
            </div>
          ) : (
            <>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Button>Send Reset Link</Button>
              <Button type="button" onClick={handleCancel} secondary>
                Cancel
              </Button>
            </>
          )}
        </form>
      )}

      {/* --- RESET PASSWORD VIEW --- */}
      {view === "RESET_PASSWORD" && (
        <form onSubmit={onResetPassword}>
          <Input
            label="New Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button>Update Password</Button>
        </form>
      )}

      {/* --- REGISTER STEP 1 --- */}
      {view === "REGISTER_STEP_1" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setView("REGISTER_STEP_2");
          }}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button>Next: Profile Details</Button>
          <Button type="button" onClick={handleCancel} secondary>
            Cancel
          </Button>
        </form>
      )}

      {/* --- REGISTER STEP 2 --- */}
      {view === "REGISTER_STEP_2" && (
        <form onSubmit={onRegister}>
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={selectStyle}
              >
                {options.genders.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Class</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                style={selectStyle}
              >
                {options.classes.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <Button loading={isRegLoading}>Complete Registration</Button>
          <Button
            type="button"
            onClick={() => setView("REGISTER_STEP_1")}
            secondary
          >
            Back
          </Button>
        </form>
      )}
    </div>
  );
};

// UI Helpers
const Input = ({ label, ...props }: any) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={labelStyle}>{label}</label>
    <input {...props} required style={inputStyle} />
  </div>
);
const Button = ({ children, loading, secondary, ...props }: any) => (
  <button
    {...props}
    disabled={loading}
    style={{
      width: "100%",
      padding: "10px",
      backgroundColor: secondary ? "#fff" : "#1e40af",
      color: secondary ? "#64748b" : "#fff",
      border: secondary ? "1px solid #cbd5e1" : "none",
      borderRadius: "6px",
      cursor: "pointer",
      marginTop: "10px",
      fontWeight: 600,
    }}
  >
    {loading ? "Processing..." : children}
  </button>
);
const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: "4px",
  color: "#475569",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box" as const,
};
const selectStyle = { ...inputStyle, height: "35px" };
const linkStyle = {
  background: "none",
  border: "none",
  color: "#1e40af",
  fontSize: "0.75rem",
  cursor: "pointer",
  fontWeight: 600,
};
