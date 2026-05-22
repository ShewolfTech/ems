/**
 * Auto-generated error classes for AttendanceRecords
 */

export class AttendanceRecordsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceRecordsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendanceRecordsValidationError);
    }
  }
}

export class AttendanceRecordsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceRecordsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AttendanceRecordsServiceError);
    }
  }
}
