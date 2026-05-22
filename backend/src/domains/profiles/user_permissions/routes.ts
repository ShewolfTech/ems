/**
 * ⚠️ Auto-generated routes for UserPermissions
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { userpermissionsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", userpermissionsController.getPermissionsMeta.bind(userpermissionsController));
router.get("/sidebar", userpermissionsController.getSidebar.bind(userpermissionsController));

// Standard CRUD Endpoints
router.get("/", userpermissionsController.getAll.bind(userpermissionsController));
router.get("/:id", userpermissionsController.getById.bind(userpermissionsController));
router.post("/", userpermissionsController.create.bind(userpermissionsController));
router.put("/:id", userpermissionsController.update.bind(userpermissionsController));
router.delete("/:id", userpermissionsController.delete.bind(userpermissionsController));

export default router;
