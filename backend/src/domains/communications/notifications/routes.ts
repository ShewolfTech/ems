/**
 * ⚠️ Auto-generated routes for Notifications
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { notificationsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", notificationsController.getPermissionsMeta.bind(notificationsController));
router.get("/sidebar", notificationsController.getSidebar.bind(notificationsController));

// Standard CRUD Endpoints
router.get("/", notificationsController.getAll.bind(notificationsController));
router.get("/:id", notificationsController.getById.bind(notificationsController));
router.post("/", notificationsController.create.bind(notificationsController));
router.put("/:id", notificationsController.update.bind(notificationsController));
router.delete("/:id", notificationsController.delete.bind(notificationsController));

export default router;
