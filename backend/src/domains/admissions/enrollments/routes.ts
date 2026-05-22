import { Router } from "express";
import { enrollmentsController } from "./controller.js";

const router = Router();

// Statistics
router.get("/statistics", enrollmentsController.getStatistics.bind(enrollmentsController));

// All enrollments
router.get("/", enrollmentsController.getAll.bind(enrollmentsController));

// Single enrollment
router.get("/:id", enrollmentsController.getById.bind(enrollmentsController));

// Create enrollment from accepted offer
router.post("/", enrollmentsController.create.bind(enrollmentsController));

// Confirm enrollment - creates student record
router.post("/:id/confirm", enrollmentsController.confirmEnrollment.bind(enrollmentsController));

// Update enrollment
router.put("/:id", enrollmentsController.update.bind(enrollmentsController));

// Delete enrollment (soft delete)
router.delete("/:id", enrollmentsController.delete.bind(enrollmentsController));

export default router;
