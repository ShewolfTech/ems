/**
 * ⚠️ Auto-generated routes for AttendanceRecords
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { attendancerecordsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", attendancerecordsController.getPermissionsMeta.bind(attendancerecordsController));
router.get("/sidebar", attendancerecordsController.getSidebar.bind(attendancerecordsController));

// Standard CRUD Endpoints
router.get("/", attendancerecordsController.getAll.bind(attendancerecordsController));
router.get("/:id", attendancerecordsController.getById.bind(attendancerecordsController));
router.post("/", attendancerecordsController.create.bind(attendancerecordsController));
router.put("/:id", attendancerecordsController.update.bind(attendancerecordsController));
router.delete("/:id", attendancerecordsController.delete.bind(attendancerecordsController));

export default router;
