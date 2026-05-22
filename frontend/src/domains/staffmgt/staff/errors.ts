/**
 * Auto-generated error classes for Staff
 */

export class StaffValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaffValidationError);
    }
  }
}

export class StaffServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaffServiceError);
    }
  }
}
