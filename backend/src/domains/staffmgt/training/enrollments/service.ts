import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { EnrollmentErrors } from "./errors.js";
import type { EnrollmentsType, CreateEnrollmentsInput, UpdateEnrollmentsInput } from "./types.js";

const EnrollmentsModel = Model.TrainingEnrollments || Model.addModel("training_enrollments", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  course_id: { type: "int" },
  enrolled_at: { type: "datetime" },
  completed_at: { type: "datetime" },
  certificate_url: { type: "varchar", length: 500 },
  grade: { type: "varchar", length: 10 },
  feedback: { type: "text" },
  status: { type: "enum", values: ["enrolled", "in-progress", "completed", "dropped", "failed"], default: "enrolled" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<EnrollmentsType>): Promise<EnrollmentsType[]> {
  return EnrollmentsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<EnrollmentsType> {
  const enrollment = await EnrollmentsModel.findByPk(id);
  if (!enrollment) throw new HttpError(404, EnrollmentErrors.NOT_FOUND);
  return enrollment;
}

async function create(data: CreateEnrollmentsInput): Promise<EnrollmentsType> {
  return EnrollmentsModel.create({
    ...data,
    enrolled_at: new Date(),
    status: "enrolled"
  } as EnrollmentsType);
}

async function update(id: number, data: UpdateEnrollmentsInput): Promise<EnrollmentsType> {
  await getById(id);
  await EnrollmentsModel.update(data, { where: { id } });
  return getById(id);
}

async function complete(id: number, grade: string, feedback: string): Promise<EnrollmentsType> {
  await getById(id);
  await EnrollmentsModel.update({
    status: "completed",
    completed_at: new Date(),
    grade,
    feedback
  }, { where: { id } });
  return getById(id);
}

async function deleteEnrollment(id: number): Promise<void> {
  await getById(id);
  await EnrollmentsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, complete, delete: deleteEnrollment };