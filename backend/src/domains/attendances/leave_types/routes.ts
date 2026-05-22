/**
 * ⚠️ Auto-generated routes for LeaveTypes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { leavetypesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", leavetypesController.getPermissionsMeta.bind(leavetypesController));
router.get("/sidebar", leavetypesController.getSidebar.bind(leavetypesController));

// Standard CRUD Endpoints
router.get("/", leavetypesController.getAll.bind(leavetypesController));
router.get("/:id", leavetypesController.getById.bind(leavetypesController));
router.post("/", leavetypesController.create.bind(leavetypesController));
router.put("/:id", leavetypesController.update.bind(leavetypesController));
router.delete("/:id", leavetypesController.delete.bind(leavetypesController));

export default router;
