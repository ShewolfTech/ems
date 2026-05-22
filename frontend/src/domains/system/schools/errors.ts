/**
 * Auto-generated error classes for Schools
 */

export class SchoolsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchoolsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchoolsValidationError);
    }
  }
}

export class SchoolsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchoolsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchoolsServiceError);
    }
  }
}
