import { Router } from "express";
import { permissionsController } from "./controller.js";

const router = Router();

router.get("/", permissionsController.getAll.bind(permissionsController));
router.get("/sidebar", permissionsController.getSidebar.bind(permissionsController));
router.get("/:id", permissionsController.getById.bind(permissionsController));
router.post("/", permissionsController.create.bind(permissionsController));
router.put("/:id", permissionsController.update.bind(permissionsController));
router.delete("/:id", permissionsController.delete.bind(permissionsController));

export default router;