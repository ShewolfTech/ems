import { Router } from "express";
import AuditlogsReport from "./auditlogs_report/index.js";
import AuditrouteReport from "./auditroute_report/index.js";

const router = Router();

router.use("/auditlogs-report", AuditlogsReport);
router.use("/auditroute-report", AuditrouteReport);

export default router;
