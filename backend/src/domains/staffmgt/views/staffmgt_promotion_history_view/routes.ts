/**
 * ⚠️ Auto-generated routes for StaffmgtPromotionHistoryView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { staffmgtpromotionhistoryviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", staffmgtpromotionhistoryviewController.getPermissionsMeta.bind(staffmgtpromotionhistoryviewController));
router.get("/sidebar", staffmgtpromotionhistoryviewController.getSidebar.bind(staffmgtpromotionhistoryviewController));

// Read-Only View Endpoints
router.get("/", staffmgtpromotionhistoryviewController.getAll.bind(staffmgtpromotionhistoryviewController));
router.get("/:id", staffmgtpromotionhistoryviewController.getById.bind(staffmgtpromotionhistoryviewController));

export default router;
