/**
 * ⚠️ Auto-generated routes for Schools
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { schoolsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", schoolsController.getPermissionsMeta.bind(schoolsController));
router.get("/sidebar", schoolsController.getSidebar.bind(schoolsController));

// Standard CRUD Endpoints
router.get("/", schoolsController.getAll.bind(schoolsController));
router.get("/:id", schoolsController.getById.bind(schoolsController));
router.post("/", schoolsController.create.bind(schoolsController));
router.put("/:id", schoolsController.update.bind(schoolsController));
router.delete("/:id", schoolsController.delete.bind(schoolsController));

export default router;
