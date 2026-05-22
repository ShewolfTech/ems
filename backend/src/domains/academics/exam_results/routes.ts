/**
 * ⚠️ Auto-generated routes for ExamResults
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { examresultsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", examresultsController.getPermissionsMeta.bind(examresultsController));
router.get("/sidebar", examresultsController.getSidebar.bind(examresultsController));

// Standard CRUD Endpoints
router.get("/", examresultsController.getAll.bind(examresultsController));
router.get("/:id", examresultsController.getById.bind(examresultsController));
router.post("/", examresultsController.create.bind(examresultsController));
router.put("/:id", examresultsController.update.bind(examresultsController));
router.delete("/:id", examresultsController.delete.bind(examresultsController));

export default router;
