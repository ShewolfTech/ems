import { Router } from "express";
import { lessonDeliveriesController } from "./controller.js";

const router = Router();

// Standard CRUD
router.get("/", lessonDeliveriesController.getAll.bind(lessonDeliveriesController));
router.get("/stats", lessonDeliveriesController.getStats.bind(lessonDeliveriesController));
router.get("/today", lessonDeliveriesController.getTodaysLessons.bind(lessonDeliveriesController));
router.get("/by-date", lessonDeliveriesController.getLessonsByDate.bind(lessonDeliveriesController));
router.post("/generate", lessonDeliveriesController.generateFromTimetables.bind(lessonDeliveriesController));
router.get("/lesson/:lessonId/history", lessonDeliveriesController.getDeliveryHistory.bind(lessonDeliveriesController));
router.get("/:id", lessonDeliveriesController.getById.bind(lessonDeliveriesController));
router.post("/", lessonDeliveriesController.create.bind(lessonDeliveriesController));
router.put("/:id", lessonDeliveriesController.update.bind(lessonDeliveriesController));

// Quick mark actions
router.post("/:id/mark-delivered", lessonDeliveriesController.quickMarkDelivered.bind(lessonDeliveriesController));
router.post("/:id/mark-cancelled", lessonDeliveriesController.quickMarkCancelled.bind(lessonDeliveriesController));
router.post("/:id/mark-postponed", lessonDeliveriesController.quickMarkPostponed.bind(lessonDeliveriesController));

router.delete("/:id", lessonDeliveriesController.delete.bind(lessonDeliveriesController));

export default router;
