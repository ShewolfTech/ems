/**
 * ⚠️ Auto-generated routes for Terms
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { termsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", termsController.getPermissionsMeta.bind(termsController));
router.get("/sidebar", termsController.getSidebar.bind(termsController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", termsController.bulkCreate.bind(termsController));

// Standard CRUD Endpoints
router.get("/", termsController.getAll.bind(termsController));
router.get("/:id", termsController.getById.bind(termsController));
router.post("/", termsController.create.bind(termsController));
router.put("/:id", termsController.update.bind(termsController));
router.delete("/:id", termsController.delete.bind(termsController));

export default router;
