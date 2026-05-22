/**
 * ⚠️ Auto-generated routes for AcademicsStudentsgradesView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { academicsstudentsgradesviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", academicsstudentsgradesviewController.getPermissionsMeta.bind(academicsstudentsgradesviewController));
router.get("/sidebar", academicsstudentsgradesviewController.getSidebar.bind(academicsstudentsgradesviewController));

// Read-Only View Endpoints
router.get("/", academicsstudentsgradesviewController.getAll.bind(academicsstudentsgradesviewController));
router.get("/:id", academicsstudentsgradesviewController.getById.bind(academicsstudentsgradesviewController));

export default router;
