/**
 * ⚠️ Auto-generated routes for AttendanceSessions
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { attendancesessionsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", attendancesessionsController.getPermissionsMeta.bind(attendancesessionsController));
router.get("/sidebar", attendancesessionsController.getSidebar.bind(attendancesessionsController));

// Standard CRUD Endpoints
router.get("/", attendancesessionsController.getAll.bind(attendancesessionsController));
router.get("/:id", attendancesessionsController.getById.bind(attendancesessionsController));
router.post("/", attendancesessionsController.create.bind(attendancesessionsController));
router.put("/:id", attendancesessionsController.update.bind(attendancesessionsController));
router.delete("/:id", attendancesessionsController.delete.bind(attendancesessionsController));

export default router;
