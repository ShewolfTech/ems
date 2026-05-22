import { Router } from "express";
import ApiKeys from "./api_keys/index.js";
import ContactTypes from "./contact_types/index.js";
import CustomFields from "./custom_fields/index.js";
import Districts from "./districts/index.js";
import Genders from "./genders/index.js";
import Integrations from "./integrations/index.js";
import RelationshipTypes from "./relationship_types/index.js";
import Schools from "./schools/index.js";
import Settings from "./settings/index.js";
import Users from "./users/index.js";
import Views from "./views/index.js";
import Webhooks from "./webhooks/index.js";
import Workflows from "./workflows/index.js";

const router = Router();

router.use("/api-keys", ApiKeys);
router.use("/contact-types", ContactTypes);
router.use("/custom-fields", CustomFields);
router.use("/districts", Districts);
router.use("/genders", Genders);
router.use("/integrations", Integrations);
router.use("/relationship-types", RelationshipTypes);
router.use("/schools", Schools);
router.use("/settings", Settings);
router.use("/users", Users);
router.use("/views", Views);
router.use("/webhooks", Webhooks);
router.use("/workflows", Workflows);

export default router;
