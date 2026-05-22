/**
 * ⚠️ Auto-generated routes for CustomFields
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { customfieldsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", customfieldsController.getPermissionsMeta.bind(customfieldsController));
router.get("/sidebar", customfieldsController.getSidebar.bind(customfieldsController));

// Standard CRUD Endpoints
router.get("/", customfieldsController.getAll.bind(customfieldsController));
router.get("/:id", customfieldsController.getById.bind(customfieldsController));
router.post("/", customfieldsController.create.bind(customfieldsController));
router.put("/:id", customfieldsController.update.bind(customfieldsController));
router.delete("/:id", customfieldsController.delete.bind(customfieldsController));

export default router;
