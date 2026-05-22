// frontend/src/domains/auth/services/authApi.ts

import axios from "axios";
import type { ApiResponse } from "../../../types/api.js";
import { ErrorCodes } from "../../../types/errors.js";
import type { LoginResponse, UserContext } from "../types.js";

const API_URL = "/api/auth";

export const authApi = {
  async login(
    identifier: string,
    password: string,
    schoolId: number,
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      const res = await axios.post<LoginResponse>(`${API_URL}/login`, {
        username: identifier,
        password,
        schoolId, // camelCase to match backend expectations
      });
      return { data: res.data, status: "success" };
    } catch (err: any) {
      return {
        error: err.response?.data?.error || "Login failed",
        code: ErrorCodes.Unauthorized,
      };
    }
  },

  async me(token: string): Promise<ApiResponse<UserContext>> {
    try {
      const res = await axios.get<UserContext>(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { data: res.data, status: "success" };
    } catch (err: any) {
      return {
        error: "Session expired",
        code: ErrorCodes.Unauthorized,
      };
    }
  },
};
