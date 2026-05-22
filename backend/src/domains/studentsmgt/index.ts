import { Router } from "express";
import Attendances from "./attendances/index.js";
import AttendanceStatus from "./attendance_status/index.js";
import Students from "./students/index.js";

const router = Router();

router.use("/attendances", Attendances);
router.use("/attendance-status", AttendanceStatus);
router.use("/students", Students);

export default router;
