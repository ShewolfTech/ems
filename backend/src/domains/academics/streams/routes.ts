import { Router } from "express";
import { streamsController } from "./controller.js";

const router = Router();
router.get("/permissions-meta", streamsController.getPermissionsMeta.bind(streamsController));
router.get("/sidebar", streamsController.getSidebar.bind(streamsController));

// Bulk Operations (MUST come before /:id to avoid route conflicts)
router.post("/bulk", streamsController.bulkCreate.bind(streamsController));

router.get("/", streamsController.getAll.bind(streamsController));
router.get("/:id", streamsController.getById.bind(streamsController));
router.post("/", streamsController.create.bind(streamsController));
router.put("/:id", streamsController.update.bind(streamsController));
router.delete("/:id", streamsController.delete.bind(streamsController));
export default router;
