/**
 * ⚠️ Auto-generated routes for Users
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { usersController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", usersController.getPermissionsMeta.bind(usersController));
router.get("/sidebar", usersController.getSidebar.bind(usersController));

// Standard CRUD Endpoints
router.get("/", usersController.getAll.bind(usersController));
router.get("/:id", usersController.getById.bind(usersController));
router.post("/", usersController.create.bind(usersController));
router.put("/:id", usersController.update.bind(usersController));
router.delete("/:id", usersController.delete.bind(usersController));

export default router;
