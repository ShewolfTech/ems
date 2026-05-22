/**
 * Auto-generated error classes for Assignments
 */

export class AssignmentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssignmentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssignmentsValidationError);
    }
  }
}

export class AssignmentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssignmentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssignmentsServiceError);
    }
  }
}
