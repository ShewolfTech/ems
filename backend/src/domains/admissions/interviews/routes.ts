import { Router } from "express";
import { interviewsController } from "./controller.js";

const router = Router();

// Statistics
router.get("/statistics", interviewsController.getStatistics.bind(interviewsController));

// Pending interviews (applications that need interviews scheduled)
router.get("/pending", interviewsController.getPendingInterviews.bind(interviewsController));

// All interviews
router.get("/", interviewsController.getAll.bind(interviewsController));

// Single interview
router.get("/:id", interviewsController.getById.bind(interviewsController));

// Create interview
router.post("/", interviewsController.create.bind(interviewsController));

// Update interview
router.put("/:id", interviewsController.update.bind(interviewsController));

// Complete interview (mark as done with outcome)
router.post("/:id/complete", interviewsController.complete.bind(interviewsController));

// Delete interview (soft delete)
router.delete("/:id", interviewsController.delete.bind(interviewsController));

export default router;
