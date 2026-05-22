/**
 * Custom Errors for Timetables
 * Auto-generated domain error classes
 */
export class TimetablesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "TimetablesError";
  }
}

export class TimetablesNotFoundError extends TimetablesError {
  constructor(id?: string | number) {
    super("Timetables record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class TimetablesValidationError extends TimetablesError {
  constructor(message?: string) {
    super(message || "Timetables validation failed", 400);
  }
}

export class TimetablesUnauthorizedError extends TimetablesError {
  constructor() {
    super("Unauthorized to perform this action on Timetables", 403);
  }
}

export class TimetablesConflictError extends TimetablesError {
  constructor(message: string = "Timetables conflict") {
    super(message, 409);
  }
}

export class TimetablesForbiddenError extends TimetablesError {
  constructor() {
    super("Forbidden: insufficient rights for Timetables", 403);
  }
}
