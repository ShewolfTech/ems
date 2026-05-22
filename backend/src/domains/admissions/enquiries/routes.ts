/**
 * Routes for Enquiries Management
 * ⚠️ IMPORTANT: Specific routes MUST come before parameterized routes (/:id)
 */
import { Router } from "express";
import { enquiriesController } from "./controller.js";

const router = Router();

// ==================== META ENDPOINTS ====================
router.get("/permissions-meta", enquiriesController.getPermissionsMeta.bind(enquiriesController));
router.get("/sidebar", enquiriesController.getSidebar.bind(enquiriesController));

// ==================== MAIN ENQUIRIES ====================
router.get("/", enquiriesController.getAll.bind(enquiriesController));
router.get("/statistics", enquiriesController.getStatistics.bind(enquiriesController));

// ⚠️ SPECIFIC ROUTES MUST COME BEFORE /:id
// ==================== ENQUIRY CATEGORIES (formerly Types) ====================
router.get("/categories", enquiriesController.getAllTypes.bind(enquiriesController));
router.post("/categories", enquiriesController.createType.bind(enquiriesController));
router.put("/categories/:id", enquiriesController.updateType.bind(enquiriesController));
router.delete("/categories/:id", enquiriesController.deleteType.bind(enquiriesController));

// Legacy /types endpoint (redirect to /categories)
router.get("/types", enquiriesController.getAllTypes.bind(enquiriesController));
router.post("/types", enquiriesController.createType.bind(enquiriesController));
router.put("/types/:id", enquiriesController.updateType.bind(enquiriesController));
router.delete("/types/:id", enquiriesController.deleteType.bind(enquiriesController));

// ==================== ENQUIRY SOURCES ====================
router.get("/sources", enquiriesController.getAllSources.bind(enquiriesController));
router.post("/sources", enquiriesController.createSource.bind(enquiriesController));
router.put("/sources/:id", enquiriesController.updateSource.bind(enquiriesController));
router.delete("/sources/:id", enquiriesController.deleteSource.bind(enquiriesController));

// ==================== PARAMETERIZED ROUTES (MUST COME LAST) ====================
router.get("/:id", enquiriesController.getById.bind(enquiriesController));
router.post("/", enquiriesController.create.bind(enquiriesController));
router.put("/:id", enquiriesController.update.bind(enquiriesController));
router.delete("/:id", enquiriesController.delete.bind(enquiriesController));

// Enquiry Actions
router.post("/:id/assign", enquiriesController.assign.bind(enquiriesController));
router.post("/:id/status", enquiriesController.updateStatus.bind(enquiriesController));
router.post("/:id/convert", enquiriesController.convertToStudent.bind(enquiriesController));

// ==================== ENQUIRY NOTES ====================
router.get("/:enquiryId/notes", enquiriesController.getNotes.bind(enquiriesController));
router.post("/:enquiryId/notes", enquiriesController.createNote.bind(enquiriesController));
router.put("/notes/:id", enquiriesController.updateNote.bind(enquiriesController));
router.delete("/notes/:id", enquiriesController.deleteNote.bind(enquiriesController));

// ==================== ENQUIRY ATTACHMENTS ====================
router.get("/:enquiryId/attachments", enquiriesController.getAttachments.bind(enquiriesController));
router.post("/:enquiryId/attachments", enquiriesController.createAttachment.bind(enquiriesController));
router.delete("/attachments/:id", enquiriesController.deleteAttachment.bind(enquiriesController));

// ==================== ENQUIRY STATUS TYPES ====================
router.get("/status-types", enquiriesController.getAllStatusTypes.bind(enquiriesController));
router.post("/status-types", enquiriesController.createStatusType.bind(enquiriesController));
router.put("/status-types/:id", enquiriesController.updateStatusType.bind(enquiriesController));
router.delete("/status-types/:id", enquiriesController.deleteStatusType.bind(enquiriesController));

// ==================== ENQUIRY PRIORITY LEVELS ====================
router.get("/priority-levels", enquiriesController.getAllPriorityLevels.bind(enquiriesController));
router.post("/priority-levels", enquiriesController.createPriorityLevel.bind(enquiriesController));
router.put("/priority-levels/:id", enquiriesController.updatePriorityLevel.bind(enquiriesController));
router.delete("/priority-levels/:id", enquiriesController.deletePriorityLevel.bind(enquiriesController));

// ==================== ENQUIRY SUBJECTS ====================
router.get("/subjects", enquiriesController.getAllSubjects.bind(enquiriesController));
router.post("/subjects", enquiriesController.createSubject.bind(enquiriesController));
router.put("/subjects/:id", enquiriesController.updateSubject.bind(enquiriesController));
router.delete("/subjects/:id", enquiriesController.deleteSubject.bind(enquiriesController));

export default router;
