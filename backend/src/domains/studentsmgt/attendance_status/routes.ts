/**
 * ⚠️ Auto-generated routes for AttendanceStatus
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { attendancestatusController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", attendancestatusController.getPermissionsMeta.bind(attendancestatusController));
router.get("/sidebar", attendancestatusController.getSidebar.bind(attendancestatusController));

// Standard CRUD Endpoints
router.get("/", attendancestatusController.getAll.bind(attendancestatusController));
router.get("/:id", attendancestatusController.getById.bind(attendancestatusController));
router.post("/", attendancestatusController.create.bind(attendancestatusController));
router.put("/:id", attendancestatusController.update.bind(attendancestatusController));
router.delete("/:id", attendancestatusController.delete.bind(attendancestatusController));

export default router;
