import { Router } from "express";
import Academics from "./academics/index.js";
import Admissions from "./admissions/index.js";
import Assetsmgt from "./assetsmgt/index.js";
import Attendances from "./attendances/index.js";
import Audit from "./audit/index.js";
import Auth from "./auth/index.js";
import Communications from "./communications/index.js";
import Filesmgt from "./filesmgt/index.js";
import Permissions from "./permissions/index.js";
import Profiles from "./profiles/index.js";
import Staffmgt from "./staffmgt/index.js";
import Storage from "./storage/index.js";
import Studentsmgt from "./studentsmgt/index.js";
import System from "./system/index.js";
import Vault from "./vault/index.js";

const router = Router();

router.use("/academics", Academics);
router.use("/admissions", Admissions);
router.use("/assetsmgt", Assetsmgt);
router.use("/attendances", Attendances);
router.use("/audit", Audit);
router.use("/auth", Auth);
router.use("/communications", Communications);
router.use("/filesmgt", Filesmgt);
router.use("/permissions", Permissions);
router.use("/profiles", Profiles);
router.use("/staffmgt", Staffmgt);
router.use("/storage", Storage);
router.use("/studentsmgt", Studentsmgt);
router.use("/system", System);
router.use("/vault", Vault);

export default router;
