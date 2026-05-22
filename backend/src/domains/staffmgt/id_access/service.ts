import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { IdAccessErrors } from "./errors.js";
import type { IdAccessType, CreateIdAccessInput, UpdateIdAccessInput } from "./types.js";

const IdAccessModel = Model.StaffIdAccess || Model.addModel("staff_id_access", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  staff_id_number: { type: "varchar", length: 50 },
  rfid_card_number: { type: "varchar", length: 100 },
  fingerprint_id: { type: "varchar", length: 100 },
  access_level: { type: "enum", values: ["full", "restricted", "limited", "none"], default: "restricted" },
  access_zones: { type: "text" },
  allowed_buildings: { type: "text" },
  allowed_entries: { type: "text" },
  valid_from: { type: "date" },
  valid_until: { type: "date" },
  status: { type: "enum", values: ["active", "inactive", "suspended", "expired"], default: "inactive" },
  issued_at: { type: "datetime" },
  returned_at: { type: "datetime" },
  issued_by: { type: "int" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<IdAccessType>): Promise<IdAccessType[]> {
  return IdAccessModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<IdAccessType> {
  const access = await IdAccessModel.findByPk(id);
  if (!access) throw new HttpError(404, IdAccessErrors.NOT_FOUND);
  return access;
}

async function create(data: CreateIdAccessInput): Promise<IdAccessType> {
  const staffIdNumber = await generateStaffIdNumber();
  return IdAccessModel.create({ 
    ...data, 
    staff_id_number: staffIdNumber,
    status: data.status || "active",
    issued_at: new Date()
  } as IdAccessType);
}

async function update(id: number, data: UpdateIdAccessInput): Promise<IdAccessType> {
  await getById(id);
  await IdAccessModel.update(data, { where: { id } });
  return getById(id);
}

async function deactivate(id: number): Promise<IdAccessType> {
  const access = await getById(id);
  if (access.status === "inactive") {
    throw new HttpError(400, IdAccessErrors.ALREADY_INACTIVE);
  }
  await IdAccessModel.update({ status: "inactive", returned_at: new Date() }, { where: { id } });
  return getById(id);
}

async function reactivate(id: number): Promise<IdAccessType> {
  const access = await getById(id);
  if (access.status === "active") {
    throw new HttpError(400, IdAccessErrors.ALREADY_ACTIVE);
  }
  await IdAccessModel.update({ status: "active", returned_at: null }, { where: { id } });
  return getById(id);
}

async function deleteAccess(id: number): Promise<void> {
  await getById(id);
  await IdAccessModel.update({ is_deleted: true }, { where: { id } });
}

async function generateStaffIdNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await IdAccessModel.count() + 1;
  return `STF${year}${count.toString().padStart(5, "0")}`;
}

export default { getAll, getById, create, update, deactivate, reactivate, delete: deleteAccess };