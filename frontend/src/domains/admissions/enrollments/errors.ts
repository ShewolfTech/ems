/**
 * Auto-generated error classes for Enrollments
 */

export class EnrollmentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnrollmentsValidationError);
    }
  }
}

export class EnrollmentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnrollmentsServiceError);
    }
  }
}
