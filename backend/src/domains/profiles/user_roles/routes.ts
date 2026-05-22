/**
 * ⚠️ Auto-generated routes for UserRoles
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { userrolesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", userrolesController.getPermissionsMeta.bind(userrolesController));
router.get("/sidebar", userrolesController.getSidebar.bind(userrolesController));

// Standard CRUD Endpoints
router.get("/", userrolesController.getAll.bind(userrolesController));
router.get("/:id", userrolesController.getById.bind(userrolesController));
router.post("/", userrolesController.create.bind(userrolesController));
router.put("/:id", userrolesController.update.bind(userrolesController));
router.delete("/:id", userrolesController.delete.bind(userrolesController));

export default router;
