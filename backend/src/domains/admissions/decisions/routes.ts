import { Router } from "express";
import { decisionsController } from "./controller.js";

const router = Router();

// Statistics
router.get("/pipeline-stats", decisionsController.getPipelineStats.bind(decisionsController));

// Backfill enrollments for existing offered decisions
router.post("/backfill-enrollments", decisionsController.backfillEnrollments.bind(decisionsController));

// Decisions
router.post("/make-decision", decisionsController.makeDecision.bind(decisionsController));
router.get("/decision/:applicationId", decisionsController.getDecision.bind(decisionsController));
router.post("/decision/:decisionId/respond", decisionsController.updateDecisionResponse.bind(decisionsController));

// Enrollments
router.post("/enroll", decisionsController.createEnrollment.bind(decisionsController));
router.post("/enrollment/:enrollmentId/complete", decisionsController.completeEnrollment.bind(decisionsController));
router.get("/enrollment/:applicationId", decisionsController.getEnrollment.bind(decisionsController));

export default router;
