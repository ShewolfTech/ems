import { Router } from "express";
import Applications from "./applications/index.js";
import Decisions from "./decisions/index.js";
import Enquiries from "./enquiries/index.js";
import Enrollments from "./enrollments/index.js";
import Exams from "./exams/index.js";
import Interviews from "./interviews/index.js";

const router = Router();

router.use("/applications", Applications);
router.use("/decisions", Decisions);
router.use("/enquiries", Enquiries);
router.use("/enrollments", Enrollments);
router.use("/exams", Exams);
router.use("/interviews", Interviews);

export default router;
