import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { LeaveQuotaErrors } from "./errors.js";
import type { CreateLeaveQuotasInput, LeaveQuotasType, UpdateLeaveQuotasInput } from "./types.js";

const LeaveQuotasModel = Model.StaffLeaveQuotas || Model.addModel("staff_leave_quotas", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  leave_type_id: { type: "int" },
  year: { type: "int" },
  total_days: { type: "decimal" },
  used_days: { type: "decimal", default: 0 },
  remaining_days: { type: "decimal" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<LeaveQuotasType>): Promise<LeaveQuotasType[]> {
  return LeaveQuotasModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<LeaveQuotasType> {
  const quota = await LeaveQuotasModel.findByPk(id);
  if (!quota) throw new HttpError(404, LeaveQuotaErrors.NOT_FOUND);
  return quota;
}

async function create(data: CreateLeaveQuotasInput): Promise<LeaveQuotasType> {
  const remaining = (data.total_days || 0) - (data.used_days || 0);
  return LeaveQuotasModel.create({ ...data, remaining_days: remaining } as LeaveQuotasType);
}

async function update(id: number, data: UpdateLeaveQuotasInput): Promise<LeaveQuotasType> {
  await getById(id);
  await LeaveQuotasModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteQuota(id: number): Promise<void> {
  await getById(id);
  await LeaveQuotasModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteQuota };