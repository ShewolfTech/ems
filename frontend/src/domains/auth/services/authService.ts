import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const authService = {
  async login(data: any) {
    const res = await axios.post(`${API_URL}/auth/login`, data);
    return res.data;
  },

  async register(data: any) {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  },

  async requestPasswordReset(email: string) {
    const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return res.data;
  },

  async updatePassword(password: string) {
    // This works because clicking the email link gives the user a temporary session
    const res = await axios.post(`${API_URL}/auth/update-password`, {
      password,
    });
    return res.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  },
};
