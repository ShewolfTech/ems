/**
 * Custom Errors for AttendanceSessions
 * Auto-generated domain error classes
 */
export class AttendanceSessionsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AttendanceSessionsError";
  }
}

export class AttendanceSessionsNotFoundError extends AttendanceSessionsError {
  constructor(id?: string | number) {
    super("AttendanceSessions record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AttendanceSessionsValidationError extends AttendanceSessionsError {
  constructor(message?: string) {
    super(message || "AttendanceSessions validation failed", 400);
  }
}

export class AttendanceSessionsUnauthorizedError extends AttendanceSessionsError {
  constructor() {
    super("Unauthorized to perform this action on AttendanceSessions", 403);
  }
}

export class AttendanceSessionsConflictError extends AttendanceSessionsError {
  constructor(message: string = "AttendanceSessions conflict") {
    super(message, 409);
  }
}

export class AttendanceSessionsForbiddenError extends AttendanceSessionsError {
  constructor() {
    super("Forbidden: insufficient rights for AttendanceSessions", 403);
  }
}
