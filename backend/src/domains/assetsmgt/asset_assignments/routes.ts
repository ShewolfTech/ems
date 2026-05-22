/**
 * ⚠️ Auto-generated routes for AssetAssignments
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { assetassignmentsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", assetassignmentsController.getPermissionsMeta.bind(assetassignmentsController));
router.get("/sidebar", assetassignmentsController.getSidebar.bind(assetassignmentsController));

// Standard CRUD Endpoints
router.get("/", assetassignmentsController.getAll.bind(assetassignmentsController));
router.get("/:id", assetassignmentsController.getById.bind(assetassignmentsController));
router.post("/", assetassignmentsController.create.bind(assetassignmentsController));
router.put("/:id", assetassignmentsController.update.bind(assetassignmentsController));
router.delete("/:id", assetassignmentsController.delete.bind(assetassignmentsController));

export default router;
