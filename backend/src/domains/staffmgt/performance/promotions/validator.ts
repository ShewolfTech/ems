import { body, param, query } from "../../../helpers/validator.js";
import { PromotionErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid promotion ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: PromotionErrors.STAFF_REQUIRED },
  current_title: {},
  new_title: { required: true, message: PromotionErrors.NEW_TITLE_REQUIRED },
  current_salary: { isNumeric: true },
  new_salary: { isNumeric: true },
  salary_currency: {},
  effective_date: { isDate: true },
  reason: {},
  notes: {},
  status: { isIn: ["pending", "approved", "rejected", "cancelled"] },
});

const update = param("id").isNumeric().withMessage("Invalid promotion ID").and(
  body({
    new_title: {},
    new_salary: { isNumeric: true },
    effective_date: { isDate: true },
    reason: {},
    notes: {},
    status: { isIn: ["pending", "approved", "rejected", "cancelled"] },
    approved_by: { isNumeric: true },
    approved_at: { isDate: true },
  })
);

export default { getAll, getById, create, update };