import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { ReviewErrors } from "./errors.js";
import type { CreateReviewsInput, ReviewsType, UpdateReviewsInput } from "./types.js";

const ReviewsModel = Model.PerformanceReviews || Model.addModel("performance_reviews", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  reviewer_id: { type: "int" },
  review_period_start: { type: "date" },
  review_period_end: { type: "date" },
  review_date: { type: "date" },
  overall_rating: { type: "enum", values: [1, 2, 3, 4, 5] },
  goals_achievement: { type: "enum", values: [1, 2, 3, 4, 5] },
  teamwork: { type: "enum", values: [1, 2, 3, 4, 5] },
  communication: { type: "enum", values: [1, 2, 3, 4, 5] },
  professionalism: { type: "enum", values: [1, 2, 3, 4, 5] },
  strengths: { type: "text" },
  areas_for_improvement: { type: "text" },
  comments: { type: "text" },
  recommendations: { type: "text" },
  status: { type: "enum", values: ["draft", "in-progress", "completed", "cancelled"], default: "draft" },
  acknowledged_at: { type: "datetime" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<ReviewsType>): Promise<ReviewsType[]> {
  return ReviewsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<ReviewsType> {
  const review = await ReviewsModel.findByPk(id);
  if (!review) throw new HttpError(404, ReviewErrors.NOT_FOUND);
  return review;
}

async function create(data: CreateReviewsInput): Promise<ReviewsType> {
  return ReviewsModel.create(data as ReviewsType);
}

async function update(id: number, data: UpdateReviewsInput): Promise<ReviewsType> {
  const existing = await getById(id);
  if (existing.status === "completed") {
    throw new HttpError(400, ReviewErrors.CANNOT_EDIT);
  }
  await ReviewsModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteReview(id: number): Promise<void> {
  await getById(id);
  await ReviewsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteReview };