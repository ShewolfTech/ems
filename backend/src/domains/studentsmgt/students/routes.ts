/**
 * Routes for Students Domain
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { studentsController } from "./controller.js";

const router = Router();

// Metadata Endpoints
router.get("/permissions-meta", studentsController.getPermissionsMeta.bind(studentsController));
router.get("/sidebar", studentsController.getSidebar.bind(studentsController));

// Statistics
router.get("/statistics", studentsController.getStatistics.bind(studentsController));

// Standard CRUD
router.get("/", studentsController.getAll.bind(studentsController));
router.get("/:id", studentsController.getById.bind(studentsController));
router.post("/", studentsController.create.bind(studentsController));
router.put("/:id", studentsController.update.bind(studentsController));
router.delete("/:id", studentsController.delete.bind(studentsController));

// Guardians (nested under student)
router.get("/:studentId/guardians", studentsController.getGuardians.bind(studentsController));
router.post("/:studentId/guardians", studentsController.createGuardian.bind(studentsController));
router.put("/guardians/:id", studentsController.updateGuardian.bind(studentsController));
router.delete("/guardians/:id", studentsController.deleteGuardian.bind(studentsController));

// Status Management
router.post("/:id/change-status", studentsController.changeStatus.bind(studentsController));
router.get("/:id/status-history", studentsController.getStatusHistory.bind(studentsController));

export default router;
