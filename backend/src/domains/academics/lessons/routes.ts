/**
 * ⚠️ Auto-generated routes for Lessons
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { lessonsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", lessonsController.getPermissionsMeta.bind(lessonsController));
router.get("/sidebar", lessonsController.getSidebar.bind(lessonsController));

// Bulk Operations (MUST come before /:id)
router.post("/bulk", lessonsController.bulkCreate.bind(lessonsController));
router.post("/generate-from-timetable", lessonsController.generateFromTimetable.bind(lessonsController));

// Standard CRUD Endpoints
router.get("/", lessonsController.getAll.bind(lessonsController));
router.get("/:id", lessonsController.getById.bind(lessonsController));
router.post("/", lessonsController.create.bind(lessonsController));
router.put("/:id", lessonsController.update.bind(lessonsController));
router.delete("/:id", lessonsController.delete.bind(lessonsController));

// Attendance Endpoints (MUST come before /:id if they were /:id/attendance, but since they use specific paths, they're fine after)
router.get("/:id/attendance", lessonsController.getAttendance.bind(lessonsController));
router.put("/:id/attendance", lessonsController.updateAttendance.bind(lessonsController));

export default router;
