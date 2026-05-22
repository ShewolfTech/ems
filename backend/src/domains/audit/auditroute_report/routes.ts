/**
 * ⚠️ Auto-generated routes for AuditrouteReport
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { auditroutereportController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", auditroutereportController.getPermissionsMeta.bind(auditroutereportController));
router.get("/sidebar", auditroutereportController.getSidebar.bind(auditroutereportController));

// Standard CRUD Endpoints
router.get("/", auditroutereportController.getAll.bind(auditroutereportController));
router.get("/:id", auditroutereportController.getById.bind(auditroutereportController));
router.post("/", auditroutereportController.create.bind(auditroutereportController));
router.put("/:id", auditroutereportController.update.bind(auditroutereportController));
router.delete("/:id", auditroutereportController.delete.bind(auditroutereportController));

export default router;
