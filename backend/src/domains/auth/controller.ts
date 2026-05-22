import { Request, Response } from "express";
import { authService } from "./service.js";
import { supabaseAdmin } from "../../config/infra/supabaseClient.js"; 

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    // Result is now { success: true, data: { token, user } }
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Login failed" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Registration failed" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // req.user was populated by authMiddleware hydration
    const { userId, email, schoolId } = (req as any).user;
    
    const result = await authService.getMe(userId, email, schoolId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not fetch user profile" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/login`,
    });
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    // Use userId from the hydrated token/middleware
    const userId = (req as any).user.userId;

    // Update password in Supabase Auth (via service)
    await authService.updatePassword(String(userId), password);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};