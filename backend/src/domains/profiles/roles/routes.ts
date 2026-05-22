/**
 * ⚠️ Auto-generated routes for Roles
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { rolesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", rolesController.getPermissionsMeta.bind(rolesController));
router.get("/sidebar", rolesController.getSidebar.bind(rolesController));

// Standard CRUD Endpoints
router.get("/", rolesController.getAll.bind(rolesController));
router.get("/:id", rolesController.getById.bind(rolesController));
router.post("/", rolesController.create.bind(rolesController));
router.put("/:id", rolesController.update.bind(rolesController));
router.delete("/:id", rolesController.delete.bind(rolesController));

export default router;
