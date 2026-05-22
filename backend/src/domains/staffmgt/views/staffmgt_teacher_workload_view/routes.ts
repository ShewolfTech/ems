/**
 * ⚠️ Auto-generated routes for StaffmgtTeacherWorkloadView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { staffmgtteacherworkloadviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", staffmgtteacherworkloadviewController.getPermissionsMeta.bind(staffmgtteacherworkloadviewController));
router.get("/sidebar", staffmgtteacherworkloadviewController.getSidebar.bind(staffmgtteacherworkloadviewController));

// Read-Only View Endpoints
router.get("/", staffmgtteacherworkloadviewController.getAll.bind(staffmgtteacherworkloadviewController));
router.get("/:id", staffmgtteacherworkloadviewController.getById.bind(staffmgtteacherworkloadviewController));

export default router;
