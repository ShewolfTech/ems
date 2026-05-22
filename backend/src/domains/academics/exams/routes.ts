/**
 * ⚠️ Auto-generated routes for Exams
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { examsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", examsController.getPermissionsMeta.bind(examsController));
router.get("/sidebar", examsController.getSidebar.bind(examsController));

// Analytics & Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk-results", examsController.bulkCreateResults.bind(examsController));
router.get("/analytics", examsController.getAnalytics.bind(examsController));

// Standard CRUD Endpoints
router.get("/", examsController.getAll.bind(examsController));
router.get("/:id", examsController.getById.bind(examsController));
router.post("/", examsController.create.bind(examsController));
router.put("/:id", examsController.update.bind(examsController));
router.delete("/:id", examsController.delete.bind(examsController));

export default router;
