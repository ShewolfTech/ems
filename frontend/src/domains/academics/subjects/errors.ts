/**
 * Auto-generated error classes for Subjects
 */

export class SubjectsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubjectsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SubjectsValidationError);
    }
  }
}

export class SubjectsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubjectsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SubjectsServiceError);
    }
  }
}
