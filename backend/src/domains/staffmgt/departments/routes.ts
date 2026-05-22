/**
 * ⚠️ Auto-generated routes for Departments
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { departmentsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", departmentsController.getPermissionsMeta.bind(departmentsController));
router.get("/sidebar", departmentsController.getSidebar.bind(departmentsController));

// Standard CRUD Endpoints
router.get("/", departmentsController.getAll.bind(departmentsController));
router.get("/:id", departmentsController.getById.bind(departmentsController));
router.post("/", departmentsController.create.bind(departmentsController));
router.put("/:id", departmentsController.update.bind(departmentsController));
router.delete("/:id", departmentsController.delete.bind(departmentsController));

export default router;
