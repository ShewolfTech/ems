/**
 * ⚠️ Auto-generated routes for RelationshipTypes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { relationshiptypesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", relationshiptypesController.getPermissionsMeta.bind(relationshiptypesController));
router.get("/sidebar", relationshiptypesController.getSidebar.bind(relationshiptypesController));

// Standard CRUD Endpoints
router.get("/", relationshiptypesController.getAll.bind(relationshiptypesController));
router.get("/:id", relationshiptypesController.getById.bind(relationshiptypesController));
router.post("/", relationshiptypesController.create.bind(relationshiptypesController));
router.put("/:id", relationshiptypesController.update.bind(relationshiptypesController));
router.delete("/:id", relationshiptypesController.delete.bind(relationshiptypesController));

export default router;
