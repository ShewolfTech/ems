import { Router } from "express";
import StaffmgtPromotionHistoryView from "./staffmgt_promotion_history_view/index.js";
import StaffmgtTeachereffectivenessView from "./staffmgt_teachereffectiveness_view/index.js";
import StaffmgtTeacherWorkloadView from "./staffmgt_teacher_workload_view/index.js";

const router = Router();

router.use("/staffmgt-promotion-history-view", StaffmgtPromotionHistoryView);
router.use("/staffmgt-teachereffectiveness-view", StaffmgtTeachereffectivenessView);
router.use("/staffmgt-teacher-workload-view", StaffmgtTeacherWorkloadView);

export default router;
