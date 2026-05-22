/**
 * ⚠️ Auto-generated routes for DocumentTypes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { documenttypesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", documenttypesController.getPermissionsMeta.bind(documenttypesController));
router.get("/sidebar", documenttypesController.getSidebar.bind(documenttypesController));

// Standard CRUD Endpoints
router.get("/", documenttypesController.getAll.bind(documenttypesController));
router.get("/:id", documenttypesController.getById.bind(documenttypesController));
router.post("/", documenttypesController.create.bind(documenttypesController));
router.put("/:id", documenttypesController.update.bind(documenttypesController));
router.delete("/:id", documenttypesController.delete.bind(documenttypesController));

export default router;
