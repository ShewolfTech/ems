import { Router } from "express";
import Buckets from "./buckets/index.js";
import Objects from "./objects/index.js";

const router = Router();

router.use("/buckets", Buckets);
router.use("/objects", Objects);

export default router;
