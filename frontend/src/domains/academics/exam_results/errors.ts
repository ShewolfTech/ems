/**
 * Auto-generated error classes for ExamResults
 */

export class ExamResultsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExamResultsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExamResultsValidationError);
    }
  }
}

export class ExamResultsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExamResultsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExamResultsServiceError);
    }
  }
}
