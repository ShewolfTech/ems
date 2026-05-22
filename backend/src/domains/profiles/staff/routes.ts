import { Router } from "express";
import { staffController } from "./controller.js";

const router = Router();

// Get all staff
router.get("/", staffController.getAll.bind(staffController));

// Get staff by ID
router.get("/:id", staffController.getById.bind(staffController));

export default router;
