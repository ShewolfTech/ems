import { Router } from "express";
import Assets from "./assets/index.js";
import AssetAssignments from "./asset_assignments/index.js";
import AssetMaintenanceLogs from "./asset_maintenance_logs/index.js";
import AssetTypes from "./asset_types/index.js";

const router = Router();

router.use("/assets", Assets);
router.use("/asset-assignments", AssetAssignments);
router.use("/asset-maintenance-logs", AssetMaintenanceLogs);
router.use("/asset-types", AssetTypes);

export default router;
