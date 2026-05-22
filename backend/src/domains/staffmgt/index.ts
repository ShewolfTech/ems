import { Router } from "express";
import Contracts from "./contracts/index.js";
import Departments from "./departments/index.js";
import Disciplinary from "./disciplinary/index.js";
import EducationLevels from "./education_levels/index.js";
import EmploymentTypes from "./employment_types/index.js";
import Hiring from "./hiring/index.js";
import IdAccess from "./id_access/index.js";
import LeaveManagement from "./leave_management/index.js";
import Payroll from "./payroll/index.js";
import Performance from "./performance/index.js";
import Staff from "./staff/index.js";
import StaffmgtRoles from "./staffmgt_roles/index.js";
import StaffAttendance from "./staff_attendance/index.js";
import Training from "./training/index.js";
import Views from "./views/index.js";

const router = Router();

router.use("/contracts", Contracts);
router.use("/departments", Departments);
router.use("/disciplinary", Disciplinary);
router.use("/education-levels", EducationLevels);
router.use("/employment-types", EmploymentTypes);
router.use("/hiring", Hiring);
router.use("/id-access", IdAccess);
router.use("/leave-management", LeaveManagement);
router.use("/payroll", Payroll);
router.use("/performance", Performance);
router.use("/staff", Staff);
router.use("/staffmgt-roles", StaffmgtRoles);
router.use("/staff-attendance", StaffAttendance);
router.use("/training", Training);
router.use("/views", Views);

export default router;
