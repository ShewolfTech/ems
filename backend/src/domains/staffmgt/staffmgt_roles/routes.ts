/**
 * ⚠️ Auto-generated routes for StaffmgtRoles
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { staffmgtrolesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", staffmgtrolesController.getPermissionsMeta.bind(staffmgtrolesController));
router.get("/sidebar", staffmgtrolesController.getSidebar.bind(staffmgtrolesController));

// Standard CRUD Endpoints
router.get("/", staffmgtrolesController.getAll.bind(staffmgtrolesController));
router.get("/:id", staffmgtrolesController.getById.bind(staffmgtrolesController));
router.post("/", staffmgtrolesController.create.bind(staffmgtrolesController));
router.put("/:id", staffmgtrolesController.update.bind(staffmgtrolesController));
router.delete("/:id", staffmgtrolesController.delete.bind(staffmgtrolesController));

export default router;
