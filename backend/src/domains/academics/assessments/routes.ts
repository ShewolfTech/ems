import { Router } from "express";
import { assessmentsController } from "./controller.js";

const router = Router();

// Metadata Endpoints
router.get("/permissions-meta", assessmentsController.getPermissionsMeta.bind(assessmentsController));
router.get("/sidebar", assessmentsController.getSidebar.bind(assessmentsController));

// Specific routes (MUST come before /:id to avoid route conflicts)
router.get("/unified-gradebook", assessmentsController.getUnifiedGradeBook.bind(assessmentsController));
router.get("/gradebook", assessmentsController.getGradeBook.bind(assessmentsController));
router.get("/student-report", assessmentsController.getStudentReport.bind(assessmentsController));
router.get("/:id/analytics", assessmentsController.getAnalytics.bind(assessmentsController));

// Standard CRUD
router.get("/", assessmentsController.getAll.bind(assessmentsController));
router.get("/:id", assessmentsController.getById.bind(assessmentsController));
router.post("/", assessmentsController.create.bind(assessmentsController));
router.put("/:id", assessmentsController.update.bind(assessmentsController));
router.delete("/:id", assessmentsController.delete.bind(assessmentsController));

export default router;
