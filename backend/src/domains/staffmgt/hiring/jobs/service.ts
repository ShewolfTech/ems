import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { JobErrors } from "./errors.js";
import type { CreateJobsInput, JobsType, UpdateJobsInput } from "./types.js";

const JobsModel = Model.Jobs || Model.addModel("jobs", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  title: { type: "varchar", length: 255 },
  description: { type: "text" },
  department_id: { type: "int" },
  employment_type: { type: "enum", values: ["full-time", "part-time", "contract", "intern"] },
  requirements: { type: "text" },
  responsibilities: { type: "text" },
  salary_min: { type: "decimal" },
  salary_max: { type: "decimal" },
  salary_currency: { type: "varchar", length: 3 },
  location: { type: "varchar", length: 255 },
  status: { type: "enum", values: ["draft", "open", "closed", "cancelled"], default: "draft" },
  posted_at: { type: "datetime" },
  closing_date: { type: "date" },
  created_by: { type: "int" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<JobsType>): Promise<JobsType[]> {
  return JobsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<JobsType> {
  const job = await JobsModel.findByPk(id);
  if (!job) throw new HttpError(404, JobErrors.NOT_FOUND);
  return job;
}

async function create(data: CreateJobsInput): Promise<JobsType> {
  return JobsModel.create(data as JobsType);
}

async function update(id: number, data: UpdateJobsInput): Promise<JobsType> {
  await getById(id);
  await JobsModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteJob(id: number): Promise<void> {
  await getById(id);
  await JobsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteJob };