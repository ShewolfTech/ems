/**
 * ⚠️ Auto-generated routes for Objects
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { objectsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", objectsController.getPermissionsMeta.bind(objectsController));
router.get("/sidebar", objectsController.getSidebar.bind(objectsController));

// Standard CRUD Endpoints
router.get("/", objectsController.getAll.bind(objectsController));
router.get("/:id", objectsController.getById.bind(objectsController));
router.post("/", objectsController.create.bind(objectsController));
router.put("/:id", objectsController.update.bind(objectsController));
router.delete("/:id", objectsController.delete.bind(objectsController));

export default router;
