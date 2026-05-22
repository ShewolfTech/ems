/**
 * ⚠️ Auto-generated routes for EducationLevels
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { educationlevelsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", educationlevelsController.getPermissionsMeta.bind(educationlevelsController));
router.get("/sidebar", educationlevelsController.getSidebar.bind(educationlevelsController));

// Standard CRUD Endpoints
router.get("/", educationlevelsController.getAll.bind(educationlevelsController));
router.get("/:id", educationlevelsController.getById.bind(educationlevelsController));
router.post("/", educationlevelsController.create.bind(educationlevelsController));
router.put("/:id", educationlevelsController.update.bind(educationlevelsController));
router.delete("/:id", educationlevelsController.delete.bind(educationlevelsController));

export default router;
