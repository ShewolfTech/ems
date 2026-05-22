import { Router } from "express";
import { gradingConfigurationsController } from "./controller.js";

const router = Router();

// Specific routes (MUST come before /:id)
router.get("/default", gradingConfigurationsController.getDefault.bind(gradingConfigurationsController));
router.get("/calculate-grade", gradingConfigurationsController.calculateGrade.bind(gradingConfigurationsController));

// Standard CRUD
router.get("/", gradingConfigurationsController.getAll.bind(gradingConfigurationsController));
router.get("/:id", gradingConfigurationsController.getById.bind(gradingConfigurationsController));
router.post("/", gradingConfigurationsController.create.bind(gradingConfigurationsController));
router.put("/:id", gradingConfigurationsController.update.bind(gradingConfigurationsController));
router.delete("/:id", gradingConfigurationsController.delete.bind(gradingConfigurationsController));

export default router;
