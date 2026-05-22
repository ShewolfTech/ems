/**
 * ⚠️ Auto-generated routes for Workflows
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { workflowsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", workflowsController.getPermissionsMeta.bind(workflowsController));
router.get("/sidebar", workflowsController.getSidebar.bind(workflowsController));

// Standard CRUD Endpoints
router.get("/", workflowsController.getAll.bind(workflowsController));
router.get("/:id", workflowsController.getById.bind(workflowsController));
router.post("/", workflowsController.create.bind(workflowsController));
router.put("/:id", workflowsController.update.bind(workflowsController));
router.delete("/:id", workflowsController.delete.bind(workflowsController));

export default router;
