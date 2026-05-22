import { Router } from "express";
import SystemRolerouteAccessView from "./system_roleroute_access_view/index.js";

const router = Router();

router.use("/system-roleroute-access-view", SystemRolerouteAccessView);

export default router;
