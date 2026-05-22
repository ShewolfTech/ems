/**
 * Auto-generated error classes for Students
 */

export class StudentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StudentsValidationError);
    }
  }
}

export class StudentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StudentsServiceError);
    }
  }
}
