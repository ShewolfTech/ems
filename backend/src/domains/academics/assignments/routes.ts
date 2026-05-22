/**
 * Routes for Assignments
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { assignmentsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", assignmentsController.getPermissionsMeta.bind(assignmentsController));
router.get("/sidebar", assignmentsController.getSidebar.bind(assignmentsController));

// Analytics (MUST come before /:id to avoid matching as ID)
router.get("/analytics", assignmentsController.getAnalytics.bind(assignmentsController));

// Bulk Operations (MUST come before /:id to avoid matching as ID)
router.post("/bulk-submissions", assignmentsController.bulkCreateSubmissions.bind(assignmentsController));

// Standard CRUD Endpoints
router.get("/", assignmentsController.getAll.bind(assignmentsController));
router.get("/:id", assignmentsController.getById.bind(assignmentsController));
router.post("/", assignmentsController.create.bind(assignmentsController));
router.put("/:id", assignmentsController.update.bind(assignmentsController));
router.delete("/:id", assignmentsController.delete.bind(assignmentsController));

export default router;
