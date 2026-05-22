// Path: backend/src/domains/auth/routes.ts
import { Router } from "express";
import { login, getMe } from "./controller.js";
import { authenticate } from "../../middleware/security/authenticate.js";

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get initial school metadata
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    Get fresh user data and school branding for session persistence
 * @access  Private
 */
router.get("/me", authenticate, getMe);

export { router as authRoutes };