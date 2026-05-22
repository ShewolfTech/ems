/**
 * Auto-generated error classes for AttendanceSessions
 */

export class AttendanceSessionsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceSessionsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendanceSessionsValidationError);
    }
  }
}

export class AttendanceSessionsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceSessionsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendanceSessionsServiceError);
    }
  }
}
