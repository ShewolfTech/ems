import { Router } from "express";
import Permissions from "./permissions/index.js";

const router = Router();

router.use("/permissions", Permissions);

export default router;
