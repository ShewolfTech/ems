import { body, param, query } from "../../../helpers/validator.js";
import { ContractErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid contract ID");

const create = body({
  staff_id: { required: true, message: ContractErrors.STAFF_REQUIRED, isNumeric: true },
  contract_type: { isIn: ["full-time", "part-time", "contract", "intern"] },
  job_title: {},
  department_id: { isNumeric: true },
  start_date: { required: true, isDate: true, message: ContractErrors.START_DATE_REQUIRED },
  end_date: { isDate: true },
  salary: { isNumeric: true },
  salary_currency: {},
  salary_frequency: { isIn: ["monthly", "bi-weekly", "weekly", "annually"] },
  probation_period_days: { isNumeric: true },
  notice_period_days: { isNumeric: true },
  terms: {},
  document_url: {},
  status: { isIn: ["draft", "pending", "active", "expired", "renewed", "terminated"] },
});

const update = param("id").isNumeric().withMessage("Invalid contract ID").and(
  body({
    contract_type: {},
    job_title: {},
    department_id: { isNumeric: true },
    end_date: { isDate: true },
    salary: { isNumeric: true },
    salary_currency: {},
    salary_frequency: {},
    probation_period_days: { isNumeric: true },
    notice_period_days: { isNumeric: true },
    terms: {},
    document_url: {},
    status: { isIn: ["draft", "pending", "active", "expired", "renewed", "terminated"] },
    signed_at: { isDate: true },
    signed_by: { isNumeric: true },
  })
);

export default { getAll, getById, create, update };