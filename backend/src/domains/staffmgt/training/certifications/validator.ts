import { body, param, query } from "../../../helpers/validator.js";
import { CertificationErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid certification ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: CertificationErrors.STAFF_REQUIRED },
  name: { required: true, message: CertificationErrors.NAME_REQUIRED },
  issuer: {},
  issue_date: { isDate: true },
  expiry_date: { isDate: true },
  credential_id: {},
  credential_url: {},
  document_url: {},
});

const update = param("id").isNumeric().withMessage("Invalid certification ID").and(
  body({
    name: {},
    issuer: {},
    issue_date: { isDate: true },
    expiry_date: { isDate: true },
    credential_id: {},
    credential_url: {},
    document_url: {},
  })
);

export default { getAll, getById, create, update };