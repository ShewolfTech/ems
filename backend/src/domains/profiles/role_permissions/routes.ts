/**
 * ⚠️ Auto-generated routes for RolePermissions
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { rolepermissionsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", rolepermissionsController.getPermissionsMeta.bind(rolepermissionsController));
router.get("/sidebar", rolepermissionsController.getSidebar.bind(rolepermissionsController));

// Standard CRUD Endpoints
router.get("/", rolepermissionsController.getAll.bind(rolepermissionsController));
router.get("/:id", rolepermissionsController.getById.bind(rolepermissionsController));
router.post("/", rolepermissionsController.create.bind(rolepermissionsController));
router.put("/:id", rolepermissionsController.update.bind(rolepermissionsController));
router.delete("/:id", rolepermissionsController.delete.bind(rolepermissionsController));

export default router;
