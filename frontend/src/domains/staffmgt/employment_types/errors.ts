/**
 * Auto-generated error classes for EmploymentTypes
 */

export class EmploymentTypesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmploymentTypesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmploymentTypesValidationError);
    }
  }
}

export class EmploymentTypesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmploymentTypesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmploymentTypesServiceError);
    }
  }
}
