/**
 * Auto-generated error classes for AttendancePolicies
 */

export class AttendancePoliciesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendancePoliciesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendancePoliciesValidationError);
    }
  }
}

export class AttendancePoliciesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendancePoliciesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendancePoliciesServiceError);
    }
  }
}
