import { Router } from "express";
import AttendancePolicies from "./attendance_policies/index.js";
import AttendanceRecords from "./attendance_records/index.js";
import AttendanceSessions from "./attendance_sessions/index.js";
import CampusAccessLogs from "./campus_access_logs/index.js";
import Leaves from "./leaves/index.js";
import LeaveTypes from "./leave_types/index.js";
import ReportAttendanceCompliance from "./report_attendance_compliance/index.js";
import ReportAttendanceSummary from "./report_attendance_summary/index.js";
import ReportLeaveSummary from "./report_leave_summary/index.js";

const router = Router();

router.use("/attendance-policies", AttendancePolicies);
router.use("/attendance-records", AttendanceRecords);
router.use("/attendance-sessions", AttendanceSessions);
router.use("/campus-access-logs", CampusAccessLogs);
router.use("/leaves", Leaves);
router.use("/leave-types", LeaveTypes);
router.use("/report-attendance-compliance", ReportAttendanceCompliance);
router.use("/report-attendance-summary", ReportAttendanceSummary);
router.use("/report-leave-summary", ReportLeaveSummary);

export default router;
