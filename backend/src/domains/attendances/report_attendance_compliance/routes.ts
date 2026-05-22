/**
 * ⚠️ Auto-generated routes for ReportAttendanceCompliance
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { reportattendancecomplianceController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", reportattendancecomplianceController.getPermissionsMeta.bind(reportattendancecomplianceController));
router.get("/sidebar", reportattendancecomplianceController.getSidebar.bind(reportattendancecomplianceController));

// Standard CRUD Endpoints
router.get("/", reportattendancecomplianceController.getAll.bind(reportattendancecomplianceController));
router.get("/:id", reportattendancecomplianceController.getById.bind(reportattendancecomplianceController));
router.post("/", reportattendancecomplianceController.create.bind(reportattendancecomplianceController));
router.put("/:id", reportattendancecomplianceController.update.bind(reportattendancecomplianceController));
router.delete("/:id", reportattendancecomplianceController.delete.bind(reportattendancecomplianceController));

export default router;
