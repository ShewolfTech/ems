import { body, param, query } from "../../../helpers/validator.js";
import { DisciplinaryErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid disciplinary ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: DisciplinaryErrors.STAFF_REQUIRED },
  incident_type: { required: true, isIn: ["verbal-warning", "written-warning", "final-warning", "suspension", "termination", "other"], message: DisciplinaryErrors.INCIDENT_TYPE_REQUIRED },
  incident_date: { isDate: true },
  description: { required: true, message: DisciplinaryErrors.DESCRIPTION_REQUIRED },
  location: {},
  witnesses: {},
  reported_by: { isNumeric: true },
  severity: { isIn: ["low", "medium", "high", "critical"] },
});

const update = param("id").isNumeric().withMessage("Invalid disciplinary ID").and(
  body({
    incident_type: {},
    incident_date: { isDate: true },
    description: {},
    location: {},
    witnesses: {},
    incident_status: { isIn: ["open", "under-investigation", "resolved", "closed"] },
    severity: { isIn: ["low", "medium", "high", "critical"] },
    action_taken: {},
  })
);

export default { getAll, getById, create, update };