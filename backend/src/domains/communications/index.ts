import { Router } from "express";
import Messages from "./messages/index.js";
import Notifications from "./notifications/index.js";

const router = Router();

router.use("/messages", Messages);
router.use("/notifications", Notifications);

export default router;
