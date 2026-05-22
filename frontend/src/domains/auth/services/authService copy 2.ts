import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const authService = {
  /**
   * LOGIN: Explicitly requires schoolId to prevent cross-tenant attempts
   */
  async login(data: {
    identifier: string;
    password: string;
    schoolId: number;
  }) {
    // 🛡️ Pre-flight check: Ensure we aren't sending an empty schoolId
    if (!data.schoolId)
      throw new Error("School selection is required for login.");

    const res = await axios.post(`${API_URL}/auth/login`, data);

    // Store token and school context for future requests
    if (res.data?.data?.token) {
      localStorage.setItem("auth_token", res.data.data.token);
      localStorage.setItem("active_school_id", String(data.schoolId));
    }

    return res.data;
  },

  async register(data: any) {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  },

  /**
   * LOGOUT: CRITICAL - Must clear all tenant-specific data
   */
  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("active_school_id");
    // Clear any other school-specific cached data
    localStorage.clear();
    window.location.href = "/login";
  },
};
