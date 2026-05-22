/**
 * ⚠️ Auto-generated routes for AcademicsClassscheduleView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { academicsclassscheduleviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", academicsclassscheduleviewController.getPermissionsMeta.bind(academicsclassscheduleviewController));
router.get("/sidebar", academicsclassscheduleviewController.getSidebar.bind(academicsclassscheduleviewController));

// Read-Only View Endpoints
router.get("/", academicsclassscheduleviewController.getAll.bind(academicsclassscheduleviewController));
router.get("/:id", academicsclassscheduleviewController.getById.bind(academicsclassscheduleviewController));

export default router;
