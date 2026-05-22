import { body, param, query } from "../../../helpers/validator.js";
import { CourseErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid course ID");

const create = body({
  title: { required: true, message: CourseErrors.TITLE_REQUIRED },
  description: {},
  category: { isIn: ["professional-development", "skills", "compliance", "leadership", "technical", "other"] },
  provider: {},
  start_date: { required: true, isDate: true, message: CourseErrors.START_DATE_REQUIRED },
  end_date: { required: true, isDate: true, message: CourseErrors.END_DATE_REQUIRED },
  duration_hours: { isNumeric: true },
  location: {},
  is_online: { isBoolean: true },
  certificate_url: {},
  cost: { isNumeric: true },
  currency: {},
  max_participants: { isNumeric: true },
  status: { isIn: ["draft", "published", "in-progress", "completed", "cancelled"] },
});

const update = param("id").isNumeric().withMessage("Invalid course ID").and(
  body({
    title: {},
    description: {},
    category: {},
    provider: {},
    start_date: { isDate: true },
    end_date: { isDate: true },
    duration_hours: { isNumeric: true },
    location: {},
    is_online: { isBoolean: true },
    certificate_url: {},
    cost: { isNumeric: true },
    currency: {},
    max_participants: { isNumeric: true },
    status: {},
  })
);

export default { getAll, getById, create, update };