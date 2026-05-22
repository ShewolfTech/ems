/**
 * Custom Errors for AttendanceRecords
 * Auto-generated domain error classes
 */
export class AttendanceRecordsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AttendanceRecordsError";
  }
}

export class AttendanceRecordsNotFoundError extends AttendanceRecordsError {
  constructor(id?: string | number) {
    super("AttendanceRecords record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AttendanceRecordsValidationError extends AttendanceRecordsError {
  constructor(message?: string) {
    super(message || "AttendanceRecords validation failed", 400);
  }
}

export class AttendanceRecordsUnauthorizedError extends AttendanceRecordsError {
  constructor() {
    super("Unauthorized to perform this action on AttendanceRecords", 403);
  }
}

export class AttendanceRecordsConflictError extends AttendanceRecordsError {
  constructor(message: string = "AttendanceRecords conflict") {
    super(message, 409);
  }
}

export class AttendanceRecordsForbiddenError extends AttendanceRecordsError {
  constructor() {
    super("Forbidden: insufficient rights for AttendanceRecords", 403);
  }
}
