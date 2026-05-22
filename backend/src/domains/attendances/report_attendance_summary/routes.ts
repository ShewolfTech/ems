/**
 * ⚠️ Auto-generated routes for ReportAttendanceSummary
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { reportattendancesummaryController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", reportattendancesummaryController.getPermissionsMeta.bind(reportattendancesummaryController));
router.get("/sidebar", reportattendancesummaryController.getSidebar.bind(reportattendancesummaryController));

// Standard CRUD Endpoints
router.get("/", reportattendancesummaryController.getAll.bind(reportattendancesummaryController));
router.get("/:id", reportattendancesummaryController.getById.bind(reportattendancesummaryController));
router.post("/", reportattendancesummaryController.create.bind(reportattendancesummaryController));
router.put("/:id", reportattendancesummaryController.update.bind(reportattendancesummaryController));
router.delete("/:id", reportattendancesummaryController.delete.bind(reportattendancesummaryController));

export default router;
