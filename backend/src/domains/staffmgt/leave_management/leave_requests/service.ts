import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { LeaveRequestErrors } from "./errors.js";
import type { CreateLeaveRequestsInput, LeaveRequestsType, UpdateLeaveRequestsInput } from "./types.js";

const LeaveRequestsModel = Model.LeaveRequests || Model.addModel("leave_requests", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  leave_type_id: { type: "int" },
  start_date: { type: "date" },
  end_date: { type: "date" },
  total_days: { type: "decimal" },
  reason: { type: "text" },
  status: { type: "enum", values: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
  approved_by: { type: "int" },
  approved_at: { type: "datetime" },
  rejection_reason: { type: "text" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<LeaveRequestsType>): Promise<LeaveRequestsType[]> {
  return LeaveRequestsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<LeaveRequestsType> {
  const request = await LeaveRequestsModel.findByPk(id);
  if (!request) throw new HttpError(404, LeaveRequestErrors.NOT_FOUND);
  return request;
}

async function create(data: CreateLeaveRequestsInput): Promise<LeaveRequestsType> {
  return LeaveRequestsModel.create(data as LeaveRequestsType);
}

async function update(id: number, data: UpdateLeaveRequestsInput): Promise<LeaveRequestsType> {
  await getById(id);
  await LeaveRequestsModel.update(data, { where: { id } });
  return getById(id);
}

async function approve(id: number, approvedBy: number): Promise<LeaveRequestsType> {
  const request = await getById(id);
  if (request.status !== "pending") {
    throw new HttpError(400, LeaveRequestErrors.ALREADY_APPROVED);
  }
  await LeaveRequestsModel.update({
    status: "approved",
    approved_by: approvedBy,
    approved_at: new Date()
  }, { where: { id } });
  return getById(id);
}

async function reject(id: number, approvedBy: number, reason: string): Promise<LeaveRequestsType> {
  const request = await getById(id);
  if (request.status !== "pending") {
    throw new HttpError(400, LeaveRequestErrors.ALREADY_REJECTED);
  }
  await LeaveRequestsModel.update({
    status: "rejected",
    approved_by: approvedBy,
    approved_at: new Date(),
    rejection_reason: reason
  }, { where: { id } });
  return getById(id);
}

async function deleteRequest(id: number): Promise<void> {
  await getById(id);
  await LeaveRequestsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, approve, reject, delete: deleteRequest };