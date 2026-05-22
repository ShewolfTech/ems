/**
 * ⚠️ Auto-generated routes for Classes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { classesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", classesController.getPermissionsMeta.bind(classesController));
router.get("/sidebar", classesController.getSidebar.bind(classesController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", classesController.bulkCreate.bind(classesController));

// Standard CRUD Endpoints
router.get("/", classesController.getAll.bind(classesController));
router.get("/:id", classesController.getById.bind(classesController));
router.post("/", classesController.create.bind(classesController));
router.put("/:id", classesController.update.bind(classesController));
router.delete("/:id", classesController.delete.bind(classesController));

// Attendance Endpoints
router.get("/:id/attendance", classesController.getAttendance.bind(classesController));
router.post("/attendance/mark", classesController.markAttendance.bind(classesController));

// Class Teachers Endpoints
router.get("/:id/teachers", classesController.getTeachers.bind(classesController));
router.post("/:id/teachers", classesController.assignTeacher.bind(classesController));
router.delete("/:id/teachers/:teacherId", classesController.removeTeacher.bind(classesController));
router.put("/:id/teachers/:teacherId", classesController.updateTeacherSubject.bind(classesController));

// Class Students Endpoints
router.post("/:id/students", classesController.addStudent.bind(classesController));
router.post("/:id/students/bulk", classesController.bulkEnrollStudents.bind(classesController));
router.delete("/:id/students/:studentId", classesController.removeStudent.bind(classesController));
router.post("/:id/students/:studentId/transfer", classesController.transferStudent.bind(classesController));

export default router;
