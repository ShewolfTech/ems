/**
 * ⚠️ Auto-generated routes for ContactTypes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { contacttypesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", contacttypesController.getPermissionsMeta.bind(contacttypesController));
router.get("/sidebar", contacttypesController.getSidebar.bind(contacttypesController));

// Standard CRUD Endpoints
router.get("/", contacttypesController.getAll.bind(contacttypesController));
router.get("/:id", contacttypesController.getById.bind(contacttypesController));
router.post("/", contacttypesController.create.bind(contacttypesController));
router.put("/:id", contacttypesController.update.bind(contacttypesController));
router.delete("/:id", contacttypesController.delete.bind(contacttypesController));

export default router;
