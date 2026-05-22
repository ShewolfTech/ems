/**
 * Custom Errors for AttendanceStatus
 * Auto-generated domain error classes
 */
export class AttendanceStatusError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AttendanceStatusError";
  }
}

export class AttendanceStatusNotFoundError extends AttendanceStatusError {
  constructor(id?: string | number) {
    super("AttendanceStatus record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AttendanceStatusValidationError extends AttendanceStatusError {
  constructor(message?: string) {
    super(message || "AttendanceStatus validation failed", 400);
  }
}

export class AttendanceStatusUnauthorizedError extends AttendanceStatusError {
  constructor() {
    super("Unauthorized to perform this action on AttendanceStatus", 403);
  }
}

export class AttendanceStatusConflictError extends AttendanceStatusError {
  constructor(message: string = "AttendanceStatus conflict") {
    super(message, 409);
  }
}

export class AttendanceStatusForbiddenError extends AttendanceStatusError {
  constructor() {
    super("Forbidden: insufficient rights for AttendanceStatus", 403);
  }
}
