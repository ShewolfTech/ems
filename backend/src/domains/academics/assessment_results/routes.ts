import { Router } from "express";
import { assessmentResultsController } from "./controller.js";

const router = Router();

// Specific routes first (must come before /:id)
router.get("/assessment/:assessmentId", assessmentResultsController.findByAssessment.bind(assessmentResultsController));
router.get("/student/:studentId", assessmentResultsController.findByStudent.bind(assessmentResultsController));
router.post("/bulk", assessmentResultsController.bulkGradeEntry.bind(assessmentResultsController));

// Standard CRUD
router.post("/", assessmentResultsController.create.bind(assessmentResultsController));
router.get("/:id", assessmentResultsController.findById.bind(assessmentResultsController));
router.put("/:id", assessmentResultsController.update.bind(assessmentResultsController));
router.delete("/:id", assessmentResultsController.delete.bind(assessmentResultsController));
router.post("/:id/finalize", assessmentResultsController.finalize.bind(assessmentResultsController));

export default router;
