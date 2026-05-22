/**
 * ⚠️ Auto-generated routes for Buckets
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { bucketsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", bucketsController.getPermissionsMeta.bind(bucketsController));
router.get("/sidebar", bucketsController.getSidebar.bind(bucketsController));

// Standard CRUD Endpoints
router.get("/", bucketsController.getAll.bind(bucketsController));
router.get("/:id", bucketsController.getById.bind(bucketsController));
router.post("/", bucketsController.create.bind(bucketsController));
router.put("/:id", bucketsController.update.bind(bucketsController));
router.delete("/:id", bucketsController.delete.bind(bucketsController));

export default router;
