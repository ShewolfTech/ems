/**
 * ⚠️ Auto-generated routes for Attendances
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { attendancesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", attendancesController.getPermissionsMeta.bind(attendancesController));
router.get("/sidebar", attendancesController.getSidebar.bind(attendancesController));

// Standard CRUD Endpoints
router.get("/", attendancesController.getAll.bind(attendancesController));
router.get("/:id", attendancesController.getById.bind(attendancesController));
router.post("/", attendancesController.create.bind(attendancesController));
router.put("/:id", attendancesController.update.bind(attendancesController));
router.delete("/:id", attendancesController.delete.bind(attendancesController));

export default router;
