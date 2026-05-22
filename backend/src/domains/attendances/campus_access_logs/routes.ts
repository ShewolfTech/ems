/**
 * ⚠️ Auto-generated routes for CampusAccessLogs
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { campusaccesslogsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", campusaccesslogsController.getPermissionsMeta.bind(campusaccesslogsController));
router.get("/sidebar", campusaccesslogsController.getSidebar.bind(campusaccesslogsController));

// Standard CRUD Endpoints
router.get("/", campusaccesslogsController.getAll.bind(campusaccesslogsController));
router.get("/:id", campusaccesslogsController.getById.bind(campusaccesslogsController));
router.post("/", campusaccesslogsController.create.bind(campusaccesslogsController));
router.put("/:id", campusaccesslogsController.update.bind(campusaccesslogsController));
router.delete("/:id", campusaccesslogsController.delete.bind(campusaccesslogsController));

export default router;
