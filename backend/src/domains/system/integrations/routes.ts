/**
 * ⚠️ Auto-generated routes for Integrations
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { integrationsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", integrationsController.getPermissionsMeta.bind(integrationsController));
router.get("/sidebar", integrationsController.getSidebar.bind(integrationsController));

// Standard CRUD Endpoints
router.get("/", integrationsController.getAll.bind(integrationsController));
router.get("/:id", integrationsController.getById.bind(integrationsController));
router.post("/", integrationsController.create.bind(integrationsController));
router.put("/:id", integrationsController.update.bind(integrationsController));
router.delete("/:id", integrationsController.delete.bind(integrationsController));

export default router;
