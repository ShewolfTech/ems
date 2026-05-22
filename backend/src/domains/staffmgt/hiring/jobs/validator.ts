import { body, param, query } from "../../../helpers/validator.js";
import { JobErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid job ID");

const create = body({
  title: { required: true, message: JobErrors.TITLE_REQUIRED },
  description: {},
  department_id: { required: true, message: JobErrors.DEPARTMENT_REQUIRED },
  employment_type: {},
  requirements: {},
  responsibilities: {},
  salary_min: { isNumeric: true },
  salary_max: { isNumeric: true },
  salary_currency: {},
  location: {},
  status: { isIn: ["draft", "open", "closed", "cancelled"] },
  closing_date: { isDate: true },
});

const update = param("id").isNumeric().withMessage("Invalid job ID").and(
  body({
    title: {},
    description: {},
    department_id: {},
    employment_type: {},
    requirements: {},
    responsibilities: {},
    salary_min: { isNumeric: true },
    salary_max: { isNumeric: true },
    salary_currency: {},
    location: {},
    status: { isIn: ["draft", "open", "closed", "cancelled"] },
    closing_date: { isDate: true },
  })
);

export default { getAll, getById, create, update };