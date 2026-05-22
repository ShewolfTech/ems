/**
 * ⚠️ Auto-generated routes for AssetTypes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { assettypesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", assettypesController.getPermissionsMeta.bind(assettypesController));
router.get("/sidebar", assettypesController.getSidebar.bind(assettypesController));

// Standard CRUD Endpoints
router.get("/", assettypesController.getAll.bind(assettypesController));
router.get("/:id", assettypesController.getById.bind(assettypesController));
router.post("/", assettypesController.create.bind(assettypesController));
router.put("/:id", assettypesController.update.bind(assettypesController));
router.delete("/:id", assettypesController.delete.bind(assettypesController));

export default router;
