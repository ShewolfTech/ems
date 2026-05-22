/**
 * Custom Errors for Assessments
 * Auto-generated domain error classes
 */
export class AssessmentsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssessmentsError";
  }
}

export class AssessmentsNotFoundError extends AssessmentsError {
  constructor(id?: string | number) {
    super("Assessments record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssessmentsValidationError extends AssessmentsError {
  constructor(message?: string) {
    super(message || "Assessments validation failed", 400);
  }
}

export class AssessmentsUnauthorizedError extends AssessmentsError {
  constructor() {
    super("Unauthorized to perform this action on Assessments", 403);
  }
}

export class AssessmentsConflictError extends AssessmentsError {
  constructor(message: string = "Assessments conflict") {
    super(message, 409);
  }
}

export class AssessmentsForbiddenError extends AssessmentsError {
  constructor() {
    super("Forbidden: insufficient rights for Assessments", 403);
  }
}
