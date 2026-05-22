import { body, param, query } from "../../../helpers/validator.js";
import { ApplicationErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid application ID");

const create = body({
  job_id: { required: true, message: ApplicationErrors.JOB_ID_REQUIRED },
  first_name: { required: true, message: ApplicationErrors.FIRST_NAME_REQUIRED },
  last_name: { required: true, message: ApplicationErrors.LAST_NAME_REQUIRED },
  email: { required: true, isEmail: true, message: ApplicationErrors.EMAIL_REQUIRED },
  phone: {},
  resume_url: {},
  cover_letter: {},
  status: { isIn: ["submitted", "screening", "interview", "offer", "rejected", "withdrawn"] },
  notes: {},
  interview_date: { isDate: true },
});

const update = param("id").isNumeric().withMessage("Invalid application ID").and(
  body({
    first_name: {},
    last_name: {},
    email: { isEmail: true },
    phone: {},
    resume_url: {},
    cover_letter: {},
    status: { isIn: ["submitted", "screening", "interview", "offer", "rejected", "withdrawn"] },
    notes: {},
    interviewer_id: { isNumeric: true },
    interview_date: { isDate: true },
  })
);

export default { getAll, getById, create, update };