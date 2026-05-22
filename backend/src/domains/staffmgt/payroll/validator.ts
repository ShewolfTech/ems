import { body, param, query } from "../../../helpers/validator.js";
import { PayrollErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid payroll ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: PayrollErrors.STAFF_REQUIRED },
  bank_name: { required: true, message: PayrollErrors.BANK_NAME_REQUIRED },
  bank_account_number: { required: true, message: PayrollErrors.ACCOUNT_NUMBER_REQUIRED },
  bank_routing_number: {},
  bank_account_name: {},
  bank_account_type: { isIn: ["checking", "savings"] },
  base_salary: { required: true, isNumeric: true, message: PayrollErrors.BASE_SALARY_REQUIRED },
  salary_currency: {},
  salary_frequency: { isIn: ["weekly", "bi-weekly", "monthly", "annually"] },
  tax_deductions: { isNumeric: true },
  benefits_deductions: { isNumeric: true },
  other_deductions: { isNumeric: true },
  is_active: { isBoolean: true },
});

const update = param("id").isNumeric().withMessage("Invalid payroll ID").and(
  body({
    bank_name: {},
    bank_account_number: {},
    bank_routing_number: {},
    bank_account_name: {},
    bank_account_type: {},
    base_salary: { isNumeric: true },
    salary_currency: {},
    salary_frequency: {},
    tax_deductions: { isNumeric: true },
    benefits_deductions: { isNumeric: true },
    other_deductions: { isNumeric: true },
    is_active: { isBoolean: true },
  })
);

export default { getAll, getById, create, update };