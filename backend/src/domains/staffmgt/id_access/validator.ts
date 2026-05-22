import { body, param, query } from "../../../helpers/validator.js";
import { IdAccessErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid access ID");

const create = body({
  staff_id: { required: true, message: IdAccessErrors.STAFF_REQUIRED, isNumeric: true },
  rfid_card_number: {},
  fingerprint_id: {},
  access_level: { isIn: ["full", "restricted", "limited", "none"] },
  access_zones: {},
  allowed_buildings: {},
  allowed_entries: {},
  valid_from: { isDate: true },
  valid_until: { isDate: true },
  status: { isIn: ["active", "inactive", "suspended", "expired"] },
});

const update = param("id").isNumeric().withMessage("Invalid access ID").and(
  body({
    rfid_card_number: {},
    fingerprint_id: {},
    access_level: { isIn: ["full", "restricted", "limited", "none"] },
    access_zones: {},
    allowed_buildings: {},
    allowed_entries: {},
    valid_from: { isDate: true },
    valid_until: { isDate: true },
    status: { isIn: ["active", "inactive", "suspended", "expired"] },
  })
);

export default { getAll, getById, create, update };