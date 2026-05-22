/**
 * ⚠️ Auto-generated routes for GradeLevels
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { gradelevelsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", gradelevelsController.getPermissionsMeta.bind(gradelevelsController));
router.get("/sidebar", gradelevelsController.getSidebar.bind(gradelevelsController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", gradelevelsController.bulkCreate.bind(gradelevelsController));

// Standard CRUD Endpoints
router.get("/", gradelevelsController.getAll.bind(gradelevelsController));
router.get("/:id", gradelevelsController.getById.bind(gradelevelsController));
router.post("/", gradelevelsController.create.bind(gradelevelsController));
router.put("/:id", gradelevelsController.update.bind(gradelevelsController));
router.delete("/:id", gradelevelsController.delete.bind(gradelevelsController));

export default router;
