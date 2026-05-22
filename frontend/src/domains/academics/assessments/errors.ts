/**
 * Auto-generated error classes for Assessments
 */

export class AssessmentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssessmentsValidationError);
    }
  }
}

export class AssessmentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssessmentsServiceError);
    }
  }
}
