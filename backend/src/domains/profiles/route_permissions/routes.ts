/**
 * ⚠️ Auto-generated routes for RoutePermissions
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { routepermissionsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", routepermissionsController.getPermissionsMeta.bind(routepermissionsController));
router.get("/sidebar", routepermissionsController.getSidebar.bind(routepermissionsController));

// Standard CRUD Endpoints
router.get("/", routepermissionsController.getAll.bind(routepermissionsController));
router.get("/:id", routepermissionsController.getById.bind(routepermissionsController));
router.post("/", routepermissionsController.create.bind(routepermissionsController));
router.put("/:id", routepermissionsController.update.bind(routepermissionsController));
router.delete("/:id", routepermissionsController.delete.bind(routepermissionsController));

export default router;
