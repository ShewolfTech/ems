/**
 * ⚠️ Auto-generated routes for Assets
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { assetsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", assetsController.getPermissionsMeta.bind(assetsController));
router.get("/sidebar", assetsController.getSidebar.bind(assetsController));

// Standard CRUD Endpoints
router.get("/", assetsController.getAll.bind(assetsController));
router.get("/:id", assetsController.getById.bind(assetsController));
router.post("/", assetsController.create.bind(assetsController));
router.put("/:id", assetsController.update.bind(assetsController));
router.delete("/:id", assetsController.delete.bind(assetsController));

export default router;
