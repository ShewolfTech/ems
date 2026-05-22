/**
 * Custom Errors for ExamResults
 * Auto-generated domain error classes
 */
export class ExamResultsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ExamResultsError";
  }
}

export class ExamResultsNotFoundError extends ExamResultsError {
  constructor(id?: string | number) {
    super("ExamResults record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ExamResultsValidationError extends ExamResultsError {
  constructor(message?: string) {
    super(message || "ExamResults validation failed", 400);
  }
}

export class ExamResultsUnauthorizedError extends ExamResultsError {
  constructor() {
    super("Unauthorized to perform this action on ExamResults", 403);
  }
}

export class ExamResultsConflictError extends ExamResultsError {
  constructor(message: string = "ExamResults conflict") {
    super(message, 409);
  }
}

export class ExamResultsForbiddenError extends ExamResultsError {
  constructor() {
    super("Forbidden: insufficient rights for ExamResults", 403);
  }
}
