/**
 * ⚠️ Auto-generated routes for Districts
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { districtsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", districtsController.getPermissionsMeta.bind(districtsController));
router.get("/sidebar", districtsController.getSidebar.bind(districtsController));

// Standard CRUD Endpoints
router.get("/", districtsController.getAll.bind(districtsController));
router.get("/:id", districtsController.getById.bind(districtsController));
router.post("/", districtsController.create.bind(districtsController));
router.put("/:id", districtsController.update.bind(districtsController));
router.delete("/:id", districtsController.delete.bind(districtsController));

export default router;
