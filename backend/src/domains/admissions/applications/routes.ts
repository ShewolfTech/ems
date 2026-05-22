import { Router } from "express";
import { admissionsController } from "./controller.js";

const router = Router();

// ==================== META / DEBUG ====================
/**
 * Test endpoint to verify token validation and user context
 */
router.get("/test", (req: any, res: any) => {
  res.json({ 
    success: true, 
    user: (req as any).user,
    message: 'Auth is working' 
  });
});

// ==================== SPECIFIC ENDPOINTS ====================
// ⚠️ IMPORTANT: These MUST come before any route using :id

// Statistics & Lookups
router.get("/statistics", admissionsController.getStatistics.bind(admissionsController));
router.get("/dashboard-stats", admissionsController.getDashboardStats.bind(admissionsController));
router.get("/statuses", admissionsController.getAllStatuses.bind(admissionsController));
router.get("/types", admissionsController.getAllTypes.bind(admissionsController));

// Enquiry Conversion
router.post("/convert-from-enquiry", admissionsController.convertEnquiry.bind(admissionsController));

// ==================== APPLICANTS ====================
router.get("/applicants", admissionsController.getAllApplicants.bind(admissionsController));
router.post("/applicants", admissionsController.createApplicant.bind(admissionsController));

// Applicant Specific
router.get("/applicants/:id", admissionsController.getApplicantById.bind(admissionsController));
router.put("/applicants/:id", admissionsController.updateApplicant.bind(admissionsController));
router.delete("/applicants/:id", admissionsController.deleteApplicant.bind(admissionsController));

// ==================== APPLICATIONS ====================
// Base routes
router.get("/", admissionsController.getAllApplications.bind(admissionsController));
router.post("/", admissionsController.createApplication.bind(admissionsController));

// Parameterized routes (MUST BE LAST)
router.get("/:id", admissionsController.getApplicationById.bind(admissionsController));
router.put("/:id", admissionsController.updateApplication.bind(admissionsController));
router.delete("/:id", admissionsController.deleteApplication.bind(admissionsController));

export default router;