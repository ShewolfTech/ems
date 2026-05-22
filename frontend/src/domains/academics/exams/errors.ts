/**
 * Auto-generated error classes for Exams
 */

export class ExamsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExamsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExamsValidationError);
    }
  }
}

export class ExamsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExamsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExamsServiceError);
    }
  }
}
