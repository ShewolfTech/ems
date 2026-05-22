import { Router } from "express";
import { examsController } from "./controller.js";

const router = Router();

// Exam Sessions
router.get("/sessions", examsController.getAllSessions.bind(examsController));
router.post("/sessions", examsController.createSession.bind(examsController));
router.put("/sessions/:id", examsController.updateSession.bind(examsController));

// Exam Definitions
router.get("/definitions", examsController.getAllDefinitions.bind(examsController));
router.post("/definitions", examsController.createDefinition.bind(examsController));
router.put("/definitions/:id", examsController.updateDefinition.bind(examsController));

// Exam Results
router.get("/", examsController.getAllExams.bind(examsController));
router.get("/application/:applicationId", examsController.getExamsByApplication.bind(examsController));
router.post("/", examsController.createExam.bind(examsController));
router.put("/:id", examsController.updateExam.bind(examsController));
router.delete("/:id", examsController.deleteExam.bind(examsController));

export default router;
