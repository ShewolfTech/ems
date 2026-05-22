/**
 * Auto-generated error classes for AttendanceStatus
 */

export class AttendanceStatusValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceStatusValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendanceStatusValidationError);
    }
  }
}

export class AttendanceStatusServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceStatusServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendanceStatusServiceError);
    }
  }
}
