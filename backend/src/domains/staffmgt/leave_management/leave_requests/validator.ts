import { body, param, query } from "../../../helpers/validator.js";
import { LeaveRequestErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid request ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: LeaveRequestErrors.STAFF_REQUIRED },
  leave_type_id: { required: true, isNumeric: true, message: LeaveRequestErrors.LEAVE_TYPE_REQUIRED },
  start_date: { required: true, isDate: true, message: LeaveRequestErrors.START_DATE_REQUIRED },
  end_date: { required: true, isDate: true, message: LeaveRequestErrors.END_DATE_REQUIRED },
  reason: {},
});

const update = param("id").isNumeric().withMessage("Invalid request ID").and(
  body({
    start_date: { isDate: true },
    end_date: { isDate: true },
    reason: {},
    status: { isIn: ["pending", "approved", "rejected", "cancelled"] },
  })
);

export default { getAll, getById, create, update };