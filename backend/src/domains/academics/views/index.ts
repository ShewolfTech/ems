import { Router } from "express";
import AcademicsAssignmentSubmissionsView from "./academics_assignment_submissions_view/index.js";
import AcademicsClassscheduleView from "./academics_classschedule_view/index.js";
import AcademicsStudentsgradesView from "./academics_studentsgrades_view/index.js";

const router = Router();

router.use("/academics-assignment-submissions-view", AcademicsAssignmentSubmissionsView);
router.use("/academics-classschedule-view", AcademicsClassscheduleView);
router.use("/academics-studentsgrades-view", AcademicsStudentsgradesView);

export default router;
