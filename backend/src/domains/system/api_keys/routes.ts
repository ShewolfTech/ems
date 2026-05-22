/**
 * ⚠️ Auto-generated routes for ApiKeys
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { apikeysController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", apikeysController.getPermissionsMeta.bind(apikeysController));
router.get("/sidebar", apikeysController.getSidebar.bind(apikeysController));

// Standard CRUD Endpoints
router.get("/", apikeysController.getAll.bind(apikeysController));
router.get("/:id", apikeysController.getById.bind(apikeysController));
router.post("/", apikeysController.create.bind(apikeysController));
router.put("/:id", apikeysController.update.bind(apikeysController));
router.delete("/:id", apikeysController.delete.bind(apikeysController));

export default router;
