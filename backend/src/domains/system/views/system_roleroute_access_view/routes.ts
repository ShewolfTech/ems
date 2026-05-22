/**
 * ⚠️ Auto-generated routes for SystemRolerouteAccessView
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { systemrolerouteaccessviewController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", systemrolerouteaccessviewController.getPermissionsMeta.bind(systemrolerouteaccessviewController));
router.get("/sidebar", systemrolerouteaccessviewController.getSidebar.bind(systemrolerouteaccessviewController));

// Read-Only View Endpoints
router.get("/", systemrolerouteaccessviewController.getAll.bind(systemrolerouteaccessviewController));
router.get("/:id", systemrolerouteaccessviewController.getById.bind(systemrolerouteaccessviewController));

export default router;
