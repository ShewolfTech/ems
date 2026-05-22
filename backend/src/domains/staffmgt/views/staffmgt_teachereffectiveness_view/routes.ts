/**
 * ⚠️ Auto-generated routes for StaffmgtTeachereffectivenessView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { staffmgtteachereffectivenessviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", staffmgtteachereffectivenessviewController.getPermissionsMeta.bind(staffmgtteachereffectivenessviewController));
router.get("/sidebar", staffmgtteachereffectivenessviewController.getSidebar.bind(staffmgtteachereffectivenessviewController));

// Read-Only View Endpoints
router.get("/", staffmgtteachereffectivenessviewController.getAll.bind(staffmgtteachereffectivenessviewController));
router.get("/:id", staffmgtteachereffectivenessviewController.getById.bind(staffmgtteachereffectivenessviewController));

export default router;
