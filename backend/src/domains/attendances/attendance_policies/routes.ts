/**
 * ⚠️ Auto-generated routes for AttendancePolicies
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { attendancepoliciesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", attendancepoliciesController.getPermissionsMeta.bind(attendancepoliciesController));
router.get("/sidebar", attendancepoliciesController.getSidebar.bind(attendancepoliciesController));

// Standard CRUD Endpoints
router.get("/", attendancepoliciesController.getAll.bind(attendancepoliciesController));
router.get("/:id", attendancepoliciesController.getById.bind(attendancepoliciesController));
router.post("/", attendancepoliciesController.create.bind(attendancepoliciesController));
router.put("/:id", attendancepoliciesController.update.bind(attendancepoliciesController));
router.delete("/:id", attendancepoliciesController.delete.bind(attendancepoliciesController));

export default router;
