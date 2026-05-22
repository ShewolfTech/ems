import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { ApplicationErrors } from "./errors.js";
import type { ApplicationsType, CreateApplicationsInput, UpdateApplicationsInput } from "./types.js";

const ApplicationsModel = Model.JobApplications || Model.addModel("job_applications", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  job_id: { type: "int" },
  first_name: { type: "varchar", length: 100 },
  last_name: { type: "varchar", length: 100 },
  email: { type: "varchar", length: 255 },
  phone: { type: "varchar", length: 50 },
  resume_url: { type: "varchar", length: 500 },
  cover_letter: { type: "text" },
  status: { type: "enum", values: ["submitted", "screening", "interview", "offer", "rejected", "withdrawn"], default: "submitted" },
  applied_at: { type: "datetime" },
  notes: { type: "text" },
  interviewer_id: { type: "int" },
  interview_date: { type: "datetime" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<ApplicationsType>): Promise<ApplicationsType[]> {
  return ApplicationsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<ApplicationsType> {
  const app = await ApplicationsModel.findByPk(id);
  if (!app) throw new HttpError(404, ApplicationErrors.NOT_FOUND);
  return app;
}

async function create(data: CreateApplicationsInput): Promise<ApplicationsType> {
  return ApplicationsModel.create(data as ApplicationsType);
}

async function update(id: number, data: UpdateApplicationsInput): Promise<ApplicationsType> {
  await getById(id);
  await ApplicationsModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteApplication(id: number): Promise<void> {
  await getById(id);
  await ApplicationsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteApplication };