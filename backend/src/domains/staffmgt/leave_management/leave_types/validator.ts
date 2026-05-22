import { body, param, query } from "../../../helpers/validator.js";
import { LeaveTypeErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid leave type ID");

const create = body({
  name: { required: true, message: LeaveTypeErrors.NAME_REQUIRED },
  code: { required: true, message: LeaveTypeErrors.CODE_REQUIRED },
  category: { required: true, isIn: ["annual", "sick", "personal", "maternity", "paternity", "bereavement", "unpaid", "other"], message: LeaveTypeErrors.CATEGORY_REQUIRED },
  description: {},
  max_days_per_year: { isNumeric: true },
  max_consecutive_days: { isNumeric: true },
  requires_approval: { isBoolean: true },
  is_paid: { isBoolean: true },
  is_active: { isBoolean: true },
});

const update = param("id").isNumeric().withMessage("Invalid leave type ID").and(
  body({
    name: {},
    code: {},
    category: { isIn: ["annual", "sick", "personal", "maternity", "paternity", "bereavement", "unpaid", "other"] },
    description: {},
    max_days_per_year: { isNumeric: true },
    max_consecutive_days: { isNumeric: true },
    requires_approval: { isBoolean: true },
    is_paid: { isBoolean: true },
    is_active: { isBoolean: true },
  })
);

export default { getAll, getById, create, update };