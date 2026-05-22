/**
 * ⚠️ Auto-generated routes for AcademicsAssignmentSubmissionsView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { academicsassignmentsubmissionsviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", academicsassignmentsubmissionsviewController.getPermissionsMeta.bind(academicsassignmentsubmissionsviewController));
router.get("/sidebar", academicsassignmentsubmissionsviewController.getSidebar.bind(academicsassignmentsubmissionsviewController));

// Read-Only View Endpoints
router.get("/", academicsassignmentsubmissionsviewController.getAll.bind(academicsassignmentsubmissionsviewController));
router.get("/:id", academicsassignmentsubmissionsviewController.getById.bind(academicsassignmentsubmissionsviewController));

export default router;
