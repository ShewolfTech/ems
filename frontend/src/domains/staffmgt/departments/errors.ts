/**
 * Auto-generated error classes for Departments
 */

export class DepartmentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DepartmentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DepartmentsValidationError);
    }
  }
}

export class DepartmentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DepartmentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DepartmentsServiceError);
    }
  }
}
