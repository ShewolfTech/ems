/**
 * ⚠️ Auto-generated routes for Timetables
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { timetablesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", timetablesController.getPermissionsMeta.bind(timetablesController));
router.get("/sidebar", timetablesController.getSidebar.bind(timetablesController));

// Standard CRUD Endpoints
router.get("/", timetablesController.getAll.bind(timetablesController));
router.get("/:id", timetablesController.getById.bind(timetablesController));
router.post("/", timetablesController.create.bind(timetablesController));
router.put("/:id", timetablesController.update.bind(timetablesController));
router.delete("/:id", timetablesController.delete.bind(timetablesController));

// Timetable Entries
router.post("/:id/entries", timetablesController.addEntry.bind(timetablesController));
router.put("/:id/entries/:entryId", timetablesController.updateEntry.bind(timetablesController));
router.delete("/:id/entries/:entryId", timetablesController.deleteEntry.bind(timetablesController));
router.post("/:id/clone", timetablesController.clone.bind(timetablesController));
router.post("/:id/generate", timetablesController.generateSmart.bind(timetablesController));

// School-wide workload
router.get("/workload", timetablesController.getSchoolWorkload.bind(timetablesController));

export default router;
