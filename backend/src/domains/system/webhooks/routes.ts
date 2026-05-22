/**
 * ⚠️ Auto-generated routes for Webhooks
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { webhooksController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", webhooksController.getPermissionsMeta.bind(webhooksController));
router.get("/sidebar", webhooksController.getSidebar.bind(webhooksController));

// Standard CRUD Endpoints
router.get("/", webhooksController.getAll.bind(webhooksController));
router.get("/:id", webhooksController.getById.bind(webhooksController));
router.post("/", webhooksController.create.bind(webhooksController));
router.put("/:id", webhooksController.update.bind(webhooksController));
router.delete("/:id", webhooksController.delete.bind(webhooksController));

export default router;
