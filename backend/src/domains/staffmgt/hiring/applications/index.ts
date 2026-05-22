import { Router } from "express";
import controller from "./controller.js";
import validator from "./validator.js";

const router = Router();

router.get("/", validator.getAll, controller.getAll);
router.get("/:id", validator.getById, controller.getById);
router.post("/", validator.create, controller.create);
router.put("/:id", validator.update, controller.update);
router.delete("/:id", controller.delete);

export default router;