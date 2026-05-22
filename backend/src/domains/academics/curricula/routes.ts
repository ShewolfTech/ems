/**
 * ⚠️ Auto-generated routes for Curricula
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { curriculaController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", curriculaController.getPermissionsMeta.bind(curriculaController));
router.get("/sidebar", curriculaController.getSidebar.bind(curriculaController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", curriculaController.bulkCreate.bind(curriculaController));

// Standard CRUD Endpoints
router.get("/", curriculaController.getAll.bind(curriculaController));
router.get("/:id", curriculaController.getById.bind(curriculaController));
router.post("/", curriculaController.create.bind(curriculaController));
router.put("/:id", curriculaController.update.bind(curriculaController));
router.delete("/:id", curriculaController.delete.bind(curriculaController));

export default router;
