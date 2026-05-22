/**
 * ⚠️ Auto-generated routes for AssetMaintenanceLogs
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { assetmaintenancelogsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", assetmaintenancelogsController.getPermissionsMeta.bind(assetmaintenancelogsController));
router.get("/sidebar", assetmaintenancelogsController.getSidebar.bind(assetmaintenancelogsController));

// Standard CRUD Endpoints
router.get("/", assetmaintenancelogsController.getAll.bind(assetmaintenancelogsController));
router.get("/:id", assetmaintenancelogsController.getById.bind(assetmaintenancelogsController));
router.post("/", assetmaintenancelogsController.create.bind(assetmaintenancelogsController));
router.put("/:id", assetmaintenancelogsController.update.bind(assetmaintenancelogsController));
router.delete("/:id", assetmaintenancelogsController.delete.bind(assetmaintenancelogsController));

export default router;
