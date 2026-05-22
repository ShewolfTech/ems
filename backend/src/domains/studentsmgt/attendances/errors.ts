/**
 * Custom Errors for Attendances
 * Auto-generated domain error classes
 */
export class AttendancesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AttendancesError";
  }
}

export class AttendancesNotFoundError extends AttendancesError {
  constructor(id?: string | number) {
    super("Attendances record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AttendancesValidationError extends AttendancesError {
  constructor(message?: string) {
    super(message || "Attendances validation failed", 400);
  }
}

export class AttendancesUnauthorizedError extends AttendancesError {
  constructor() {
    super("Unauthorized to perform this action on Attendances", 403);
  }
}

export class AttendancesConflictError extends AttendancesError {
  constructor(message: string = "Attendances conflict") {
    super(message, 409);
  }
}

export class AttendancesForbiddenError extends AttendancesError {
  constructor() {
    super("Forbidden: insufficient rights for Attendances", 403);
  }
}
