/**
 * Auto-generated error classes for LeaveTypes
 */

export class LeaveTypesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaveTypesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LeaveTypesValidationError);
    }
  }
}

export class LeaveTypesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaveTypesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LeaveTypesServiceError);
    }
  }
}
