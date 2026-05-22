/**
 * ⚠️ Auto-generated routes for Messages
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { messagesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", messagesController.getPermissionsMeta.bind(messagesController));
router.get("/sidebar", messagesController.getSidebar.bind(messagesController));

// Standard CRUD Endpoints
router.get("/", messagesController.getAll.bind(messagesController));
router.get("/:id", messagesController.getById.bind(messagesController));
router.post("/", messagesController.create.bind(messagesController));
router.put("/:id", messagesController.update.bind(messagesController));
router.delete("/:id", messagesController.delete.bind(messagesController));

export default router;
