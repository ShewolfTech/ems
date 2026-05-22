/**
 * ⚠️ Enhanced Routes for Staff Management
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { staffController } from "./staff/controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", staffController.getPermissionsMeta.bind(staffController));
router.get("/sidebar", staffController.getSidebar.bind(staffController));

// Statistics Endpoint
router.get("/statistics", staffController.getStatistics.bind(staffController));

// Standard CRUD Endpoints
router.get("/", staffController.getAll.bind(staffController));
router.get("/:id", staffController.getById.bind(staffController));
router.post("/", staffController.create.bind(staffController));
router.put("/:id", staffController.update.bind(staffController));
router.delete("/:id", staffController.delete.bind(staffController));

export default router;
