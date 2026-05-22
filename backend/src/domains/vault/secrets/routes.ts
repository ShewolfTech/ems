/**
 * ⚠️ Auto-generated routes for Secrets
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { secretsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", secretsController.getPermissionsMeta.bind(secretsController));
router.get("/sidebar", secretsController.getSidebar.bind(secretsController));

// Standard CRUD Endpoints
router.get("/", secretsController.getAll.bind(secretsController));
router.get("/:id", secretsController.getById.bind(secretsController));
router.post("/", secretsController.create.bind(secretsController));
router.put("/:id", secretsController.update.bind(secretsController));
router.delete("/:id", secretsController.delete.bind(secretsController));

export default router;
