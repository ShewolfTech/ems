import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { PayrollErrors } from "./errors.js";
import type { PayrollType, CreatePayrollInput, UpdatePayrollInput } from "./types.js";

const PayrollModel = Model.StaffPayroll || Model.addModel("staff_payroll", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  bank_name: { type: "varchar", length: 255 },
  bank_account_number: { type: "varchar", length: 50 },
  bank_routing_number: { type: "varchar", length: 50 },
  bank_account_name: { type: "varchar", length: 255 },
  bank_account_type: { type: "enum", values: ["checking", "savings"] },
  base_salary: { type: "decimal" },
  salary_currency: { type: "varchar", length: 3 },
  salary_frequency: { type: "enum", values: ["weekly", "bi-weekly", "monthly", "annually"], default: "monthly" },
  tax_deductions: { type: "decimal", default: 0 },
  benefits_deductions: { type: "decimal", default: 0 },
  other_deductions: { type: "decimal", default: 0 },
  net_salary: { type: "decimal" },
  is_active: { type: "boolean", default: true },
  last_paid_date: { type: "date" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<PayrollType>): Promise<PayrollType[]> {
  return PayrollModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<PayrollType> {
  const payroll = await PayrollModel.findByPk(id);
  if (!payroll) throw new HttpError(404, PayrollErrors.NOT_FOUND);
  return payroll;
}

async function create(data: CreatePayrollInput): Promise<PayrollType> {
  const netSalary = (data.base_salary || 0) - (data.tax_deductions || 0) - (data.benefits_deductions || 0) - (data.other_deductions || 0);
  return PayrollModel.create({ ...data, net_salary: netSalary } as PayrollType);
}

async function update(id: number, data: UpdatePayrollInput): Promise<PayrollType> {
  const existing = await getById(id);
  const baseSalary = data.base_salary || existing.base_salary;
  const tax = data.tax_deductions ?? existing.tax_deductions || 0;
  const benefits = data.benefits_deductions ?? existing.benefits_deductions || 0;
  const other = data.other_deductions ?? existing.other_deductions || 0;
  
  await PayrollModel.update({ ...data, net_salary: baseSalary - tax - benefits - other }, { where: { id } });
  return getById(id);
}

async function deletePayroll(id: number): Promise<void> {
  await getById(id);
  await PayrollModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deletePayroll };