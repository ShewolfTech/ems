import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { DisciplinaryErrors } from "./errors.js";
import type { DisciplinaryType, CreateDisciplinaryInput, UpdateDisciplinaryInput } from "./types.js";

const DisciplinaryModel = Model.DisciplinaryIncidents || Model.addModel("disciplinary_incidents", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  incident_type: { type: "enum", values: ["verbal-warning", "written-warning", "final-warning", "suspension", "termination", "other"] },
  incident_date: { type: "date" },
  description: { type: "text" },
  location: { type: "varchar", length: 255 },
  witnesses: { type: "text" },
  reported_by: { type: "int" },
  incident_status: { type: "enum", values: ["open", "under-investigation", "resolved", "closed"], default: "open" },
  severity: { type: "enum", values: ["low", "medium", "high", "critical"] },
  action_taken: { type: "text" },
  resolved_by: { type: "int" },
  resolved_at: { type: "datetime" },
  resolution_notes: { type: "text" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<DisciplinaryType>): Promise<DisciplinaryType[]> {
  return DisciplinaryModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<DisciplinaryType> {
  const record = await DisciplinaryModel.findByPk(id);
  if (!record) throw new HttpError(404, DisciplinaryErrors.NOT_FOUND);
  return record;
}

async function create(data: CreateDisciplinaryInput): Promise<DisciplinaryType> {
  return DisciplinaryModel.create(data as DisciplinaryType);
}

async function update(id: number, data: UpdateDisciplinaryInput): Promise<DisciplinaryType> {
  await getById(id);
  await DisciplinaryModel.update(data, { where: { id } });
  return getById(id);
}

async function resolve(id: number, resolvedBy: number, resolutionNotes: string, actionTaken: string): Promise<DisciplinaryType> {
  const record = await getById(id);
  if (record.incident_status === "resolved" || record.incident_status === "closed") {
    throw new HttpError(400, DisciplinaryErrors.ALREADY_RESOLVED);
  }
  await DisciplinaryModel.update({
    incident_status: "resolved",
    resolved_by: resolvedBy,
    resolved_at: new Date(),
    resolution_notes: resolutionNotes,
    action_taken: actionTaken
  }, { where: { id } });
  return getById(id);
}

async function deleteRecord(id: number): Promise<void> {
  await getById(id);
  await DisciplinaryModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, resolve, delete: deleteRecord };