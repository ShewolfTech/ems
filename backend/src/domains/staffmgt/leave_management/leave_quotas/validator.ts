import { body, param, query } from "../../../helpers/validator.js";
import { LeaveQuotaErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid quota ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: LeaveQuotaErrors.STAFF_REQUIRED },
  leave_type_id: { required: true, isNumeric: true, message: LeaveQuotaErrors.LEAVE_TYPE_REQUIRED },
  year: { required: true, isNumeric: true, message: LeaveQuotaErrors.YEAR_REQUIRED },
  total_days: { required: true, isNumeric: true },
  used_days: { isNumeric: true },
});

const update = param("id").isNumeric().withMessage("Invalid quota ID").and(
  body({
    total_days: { isNumeric: true },
    used_days: { isNumeric: true },
  })
);

export default { getAll, getById, create, update };