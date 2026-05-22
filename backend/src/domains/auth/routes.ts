import { Router } from "express";
import * as authController from "./controller.js";
import { authenticate } from "../../middleware/security/authenticate.js";

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get initial school metadata
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Step 1 & 2: Create auth record and public profile in one flow
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Trigger Supabase password reset email
 * @access  Public
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get fresh user data and school branding for session persistence
 * @access  Private (Requires JWT)
 */
router.get("/me", authenticate, authController.getMe);

export { router as authRoutes };