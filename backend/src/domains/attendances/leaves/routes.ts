/**
 * ⚠️ Auto-generated routes for Leaves
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { leavesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", leavesController.getPermissionsMeta.bind(leavesController));
router.get("/sidebar", leavesController.getSidebar.bind(leavesController));

// Custom Leave Workflow Endpoints
router.get("/approvers", leavesController.getApprovers.bind(leavesController));

// Standard CRUD Endpoints
router.get("/", leavesController.getAll.bind(leavesController));
router.get("/:id", leavesController.getById.bind(leavesController));
router.post("/", leavesController.create.bind(leavesController));
router.put("/:id", leavesController.update.bind(leavesController));
router.delete("/:id", leavesController.delete.bind(leavesController));

export default router;
