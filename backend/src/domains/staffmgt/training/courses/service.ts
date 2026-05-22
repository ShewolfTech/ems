import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { CourseErrors } from "./errors.js";
import type { CoursesType, CreateCoursesInput, UpdateCoursesInput } from "./types.js";

const CoursesModel = Model.TrainingCourses || Model.addModel("training_courses", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  title: { type: "varchar", length: 255 },
  description: { type: "text" },
  category: { type: "enum", values: ["professional-development", "skills", "compliance", "leadership", "technical", "other"] },
  provider: { type: "varchar", length: 255 },
  start_date: { type: "date" },
  end_date: { type: "date" },
  duration_hours: { type: "decimal" },
  location: { type: "varchar", length: 255 },
  is_online: { type: "boolean", default: false },
  certificate_url: { type: "varchar", length: 500 },
  cost: { type: "decimal" },
  currency: { type: "varchar", length: 3 },
  max_participants: { type: "int" },
  status: { type: "enum", values: ["draft", "published", "in-progress", "completed", "cancelled"], default: "draft" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<CoursesType>): Promise<CoursesType[]> {
  return CoursesModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<CoursesType> {
  const course = await CoursesModel.findByPk(id);
  if (!course) throw new HttpError(404, CourseErrors.NOT_FOUND);
  return course;
}

async function create(data: CreateCoursesInput): Promise<CoursesType> {
  return CoursesModel.create(data as CoursesType);
}

async function update(id: number, data: UpdateCoursesInput): Promise<CoursesType> {
  await getById(id);
  await CoursesModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteCourse(id: number): Promise<void> {
  await getById(id);
  await CoursesModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteCourse };