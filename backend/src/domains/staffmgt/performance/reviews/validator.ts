import { body, param, query } from "../../../helpers/validator.js";
import { ReviewErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid review ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: ReviewErrors.STAFF_REQUIRED },
  reviewer_id: { required: true, isNumeric: true, message: ReviewErrors.REVIEWER_REQUIRED },
  review_period_start: { isDate: true },
  review_period_end: { isDate: true },
  overall_rating: { isIn: [1, 2, 3, 4, 5] },
  goals_achievement: { isIn: [1, 2, 3, 4, 5] },
  teamwork: { isIn: [1, 2, 3, 4, 5] },
  communication: { isIn: [1, 2, 3, 4, 5] },
  professionalism: { isIn: [1, 2, 3, 4, 5] },
  strengths: {},
  areas_for_improvement: {},
  comments: {},
  recommendations: {},
  status: { isIn: ["draft", "in-progress", "completed", "cancelled"] },
});

const update = param("id").isNumeric().withMessage("Invalid review ID").and(
  body({
    overall_rating: { isIn: [1, 2, 3, 4, 5] },
    goals_achievement: { isIn: [1, 2, 3, 4, 5] },
    teamwork: { isIn: [1, 2, 3, 4, 5] },
    communication: { isIn: [1, 2, 3, 4, 5] },
    professionalism: { isIn: [1, 2, 3, 4, 5] },
    strengths: {},
    areas_for_improvement: {},
    comments: {},
    recommendations: {},
    status: { isIn: ["draft", "in-progress", "completed", "cancelled"] },
  })
);

export default { getAll, getById, create, update };