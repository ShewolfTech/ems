import { Router } from "express";

const router = Router();

// The student report functionality is already provided by:
// GET /academics/assessments/student-report?student_id=X
// This route is kept for future custom report endpoints

router.get("/permissions-meta", (req, res) => {
  res.json({
    permissions: ["student_report.read"],
    resource: "student_report",
  });
});

router.get("/sidebar", (req, res) => {
  res.json({
    title: "Student Report",
    icon: "GraduationCap",
    description: "Comprehensive student performance analytics",
  });
});

export default router;
