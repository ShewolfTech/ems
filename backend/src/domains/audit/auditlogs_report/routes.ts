/**
 * ⚠️ Auto-generated routes for AuditlogsReport
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { auditlogsreportController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", auditlogsreportController.getPermissionsMeta.bind(auditlogsreportController));
router.get("/sidebar", auditlogsreportController.getSidebar.bind(auditlogsreportController));

// Standard CRUD Endpoints
router.get("/", auditlogsreportController.getAll.bind(auditlogsreportController));
router.get("/:id", auditlogsreportController.getById.bind(auditlogsreportController));
router.post("/", auditlogsreportController.create.bind(auditlogsreportController));
router.put("/:id", auditlogsreportController.update.bind(auditlogsreportController));
router.delete("/:id", auditlogsreportController.delete.bind(auditlogsreportController));

export default router;
