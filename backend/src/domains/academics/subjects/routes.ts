/**
 * ⚠️ Auto-generated routes for Subjects
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { subjectsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", subjectsController.getPermissionsMeta.bind(subjectsController));
router.get("/sidebar", subjectsController.getSidebar.bind(subjectsController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", subjectsController.bulkCreate.bind(subjectsController));

// Standard CRUD Endpoints
router.get("/", subjectsController.getAll.bind(subjectsController));
router.get("/:id", subjectsController.getById.bind(subjectsController));
router.post("/", subjectsController.create.bind(subjectsController));
router.put("/:id", subjectsController.update.bind(subjectsController));
router.delete("/:id", subjectsController.delete.bind(subjectsController));

export default router;
