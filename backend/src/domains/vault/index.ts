import { Router } from "express";
import Secrets from "./secrets/index.js";

const router = Router();

router.use("/secrets", Secrets);

export default router;
