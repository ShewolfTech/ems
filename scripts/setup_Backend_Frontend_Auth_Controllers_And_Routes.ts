import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const AUTH_DIR = path.join(projectRoot, "backend/src/domains/auth");

const controllerContent = `
import { Request, Response, NextFunction } from "express";
import { authService } from "./service.js";
import { LoginSchema, RegisterSchema } from "./validator.js";
import { ZodError } from "zod";

/**
 * AUTH CONTROLLER
 * Handles HTTP interface logic. Keeps Express-specific code out of the Service.
 */
export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate Input
      const validatedData = LoginSchema.parse(req.body);

      // 2. Call Service Logic
      const session = await authService.login(validatedData);

      // 3. Success Response
      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation Failed",
          // Fixed: Using .flatten() to avoid TS2339 'errors' property issue
          details: error.flatten().fieldErrors
        });
      }
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const user = await authService.register(validatedData);
      
      return res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: "Registration Failed",
          details: error.flatten().fieldErrors 
        });
      }
      next(error);
    }
  }

  // Used by AuthContext on page refresh to verify session
  async me(req: any, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    return res.json({ success: true, data: req.user });
  }
}

export const authController = new AuthController();
`;

const routesContent = `
import { Router } from "express";
import { authController } from "./controller.js";

const router = Router();

/**
 * PUBLIC ROUTES
 */
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));

/**
 * PROTECTED ROUTES
 */
router.get("/me", authController.me.bind(authController));

export const authRoutes = router;
`;

async function run() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });

    await fs.writeFile(path.join(AUTH_DIR, "controller.ts"), controllerContent.trim());
    await fs.writeFile(path.join(AUTH_DIR, "routes.ts"), routesContent.trim());

    console.log("--------------------------------------------------");
    console.log("✅ Backend Controllers & Routes Generated.");
    console.log("✅ Applied .flatten() fix for Zod compatibility.");
    console.log("✅ Routes bound to controller instance.");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Generation failed:", error);
  }
}

run();