/**
 * ⚠️ Auto-generated routes for Genders
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { gendersController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", gendersController.getPermissionsMeta.bind(gendersController));
router.get("/sidebar", gendersController.getSidebar.bind(gendersController));

// Standard CRUD Endpoints
router.get("/", gendersController.getAll.bind(gendersController));
router.get("/:id", gendersController.getById.bind(gendersController));
router.post("/", gendersController.create.bind(gendersController));
router.put("/:id", gendersController.update.bind(gendersController));
router.delete("/:id", gendersController.delete.bind(gendersController));

export default router;
