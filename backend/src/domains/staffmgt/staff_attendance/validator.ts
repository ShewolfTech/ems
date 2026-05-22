import { body, param, query } from "../../../helpers/validator.js";
import { AttendanceErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid attendance ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: AttendanceErrors.STAFF_REQUIRED },
  date: { isDate: true },
  clock_in_time: { isDate: true },
  clock_out_time: { isDate: true },
  status: { isIn: ["present", "absent", "late", "excused", "on-leave"] },
  notes: {},
  device_id: {},
});

const update = param("id").isNumeric().withMessage("Invalid attendance ID").and(
  body({
    clock_in_time: { isDate: true },
    clock_out_time: { isDate: true },
    status: { isIn: ["present", "absent", "late", "excused", "on-leave"] },
    notes: {},
    late_minutes: { isNumeric: true },
    early_leave_minutes: { isNumeric: true },
    total_hours: { isNumeric: true },
  })
);

export default { getAll, getById, create, update };