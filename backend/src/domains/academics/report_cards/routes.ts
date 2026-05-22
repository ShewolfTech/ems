/**
 * ⚠️ Auto-generated routes for ReportCards
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { reportcardsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", reportcardsController.getPermissionsMeta.bind(reportcardsController));
router.get("/sidebar", reportcardsController.getSidebar.bind(reportcardsController));

// Standard CRUD Endpoints
router.get("/", reportcardsController.getAll.bind(reportcardsController));
router.get("/:id", reportcardsController.getById.bind(reportcardsController));
router.post("/", reportcardsController.create.bind(reportcardsController));
router.put("/:id", reportcardsController.update.bind(reportcardsController));
router.delete("/:id", reportcardsController.delete.bind(reportcardsController));

export default router;
