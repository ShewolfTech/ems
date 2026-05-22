import { body, param, query } from "../../../helpers/validator.js";
import { EnrollmentErrors } from "./errors.js";

const getAll = query().optional();

const getById = param("id").isNumeric().withMessage("Invalid enrollment ID");

const create = body({
  staff_id: { required: true, isNumeric: true, message: EnrollmentErrors.STAFF_REQUIRED },
  course_id: { required: true, isNumeric: true, message: EnrollmentErrors.COURSE_REQUIRED },
});

const update = param("id").isNumeric().withMessage("Invalid enrollment ID").and(
  body({
    grade: {},
    feedback: {},
    status: { isIn: ["enrolled", "in-progress", "completed", "dropped", "failed"] },
    certificate_url: {},
  })
);

export default { getAll, getById, create, update };