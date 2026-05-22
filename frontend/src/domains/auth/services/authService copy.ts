import { LoginInput, RegisterInput } from "../validator.js";
import { AuthSession } from "../types.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const authService = {
  async login(
    data: LoginInput,
  ): Promise<{ success: boolean; data: AuthSession }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  async logout(): Promise<void> {
    // Logic for clearing tokens/session on backend if needed
    console.log("Logging out...");
  },
};
