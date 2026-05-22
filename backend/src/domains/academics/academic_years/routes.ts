/**
 * ⚠️ Auto-generated routes for AcademicYears
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { academicyearsController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", academicyearsController.getPermissionsMeta.bind(academicyearsController));
router.get("/sidebar", academicyearsController.getSidebar.bind(academicyearsController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", academicyearsController.bulkCreate.bind(academicyearsController));

// Standard CRUD Endpoints
router.get("/", academicyearsController.getAll.bind(academicyearsController));
router.get("/:id", academicyearsController.getById.bind(academicyearsController));
router.post("/", academicyearsController.create.bind(academicyearsController));
router.put("/:id", academicyearsController.update.bind(academicyearsController));
router.delete("/:id", academicyearsController.delete.bind(academicyearsController));

export default router;
