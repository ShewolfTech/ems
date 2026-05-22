/**
 * ⚠️ Auto-generated routes for EmploymentTypes
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { employmenttypesController } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", employmenttypesController.getPermissionsMeta.bind(employmenttypesController));
router.get("/sidebar", employmenttypesController.getSidebar.bind(employmenttypesController));

// Standard CRUD Endpoints
router.get("/", employmenttypesController.getAll.bind(employmenttypesController));
router.get("/:id", employmenttypesController.getById.bind(employmenttypesController));
router.post("/", employmenttypesController.create.bind(employmenttypesController));
router.put("/:id", employmenttypesController.update.bind(employmenttypesController));
router.delete("/:id", employmenttypesController.delete.bind(employmenttypesController));

export default router;
