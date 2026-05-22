import { Router } from "express";
import DocumentTypes from "./document_types/index.js";
import Files from "./files/index.js";

const router = Router();

router.use("/document-types", DocumentTypes);
router.use("/files", Files);

export default router;
