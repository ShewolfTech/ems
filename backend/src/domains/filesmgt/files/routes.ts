/**
 * ⚠️ Auto-generated routes for Files
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { filesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", filesController.getPermissionsMeta.bind(filesController));
router.get("/sidebar", filesController.getSidebar.bind(filesController));

// Standard CRUD Endpoints
router.get("/", filesController.getAll.bind(filesController));
router.get("/:id", filesController.getById.bind(filesController));
router.post("/", filesController.create.bind(filesController));
router.put("/:id", filesController.update.bind(filesController));
router.delete("/:id", filesController.delete.bind(filesController));

export default router;
