/**
 * ⚠️ Auto-generated routes for Settings
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { settingsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", settingsController.getPermissionsMeta.bind(settingsController));
router.get("/sidebar", settingsController.getSidebar.bind(settingsController));

// Standard CRUD Endpoints
router.get("/", settingsController.getAll.bind(settingsController));
router.get("/:id", settingsController.getById.bind(settingsController));
router.post("/", settingsController.create.bind(settingsController));
router.put("/:id", settingsController.update.bind(settingsController));
router.delete("/:id", settingsController.delete.bind(settingsController));

export default router;
