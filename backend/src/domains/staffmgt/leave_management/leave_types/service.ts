import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { LeaveTypeErrors } from "./errors.js";
import type { CreateLeaveTypesInput, LeaveTypesType, UpdateLeaveTypesInput } from "./types.js";

const LeaveTypesModel = Model.LeaveTypes || Model.addModel("leave_types", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  name: { type: "varchar", length: 100 },
  code: { type: "varchar", length: 20 },
  category: { type: "enum", values: ["annual", "sick", "personal", "maternity", "paternity", "bereavement", "unpaid", "other"] },
  description: { type: "text" },
  max_days_per_year: { type: "int" },
  max_consecutive_days: { type: "int" },
  requires_approval: { type: "boolean", default: true },
  is_paid: { type: "boolean", default: true },
  is_active: { type: "boolean", default: true },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<LeaveTypesType>): Promise<LeaveTypesType[]> {
  return LeaveTypesModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<LeaveTypesType> {
  const type = await LeaveTypesModel.findByPk(id);
  if (!type) throw new HttpError(404, LeaveTypeErrors.NOT_FOUND);
  return type;
}

async function create(data: CreateLeaveTypesInput): Promise<LeaveTypesType> {
  return LeaveTypesModel.create(data as LeaveTypesType);
}

async function update(id: number, data: UpdateLeaveTypesInput): Promise<LeaveTypesType> {
  await getById(id);
  await LeaveTypesModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteLeaveType(id: number): Promise<void> {
  await getById(id);
  await LeaveTypesModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteLeaveType };