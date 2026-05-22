/**
 * ⚠️ Auto-generated routes for ReportLeaveSummary
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { reportleavesummaryController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", reportleavesummaryController.getPermissionsMeta.bind(reportleavesummaryController));
router.get("/sidebar", reportleavesummaryController.getSidebar.bind(reportleavesummaryController));

// Standard CRUD Endpoints
router.get("/", reportleavesummaryController.getAll.bind(reportleavesummaryController));
router.get("/:id", reportleavesummaryController.getById.bind(reportleavesummaryController));
router.post("/", reportleavesummaryController.create.bind(reportleavesummaryController));
router.put("/:id", reportleavesummaryController.update.bind(reportleavesummaryController));
router.delete("/:id", reportleavesummaryController.delete.bind(reportleavesummaryController));

export default router;
