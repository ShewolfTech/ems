/**
 * Custom Errors for Staff
 * Auto-generated domain error classes
 */
export class StaffError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "StaffError";
  }
}

export class StaffNotFoundError extends StaffError {
  constructor(id?: string | number) {
    super("Staff record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class StaffValidationError extends StaffError {
  constructor(message?: string) {
    super(message || "Staff validation failed", 400);
  }
}

export class StaffUnauthorizedError extends StaffError {
  constructor() {
    super("Unauthorized to perform this action on Staff", 403);
  }
}

export class StaffConflictError extends StaffError {
  constructor(message: string = "Staff conflict") {
    super(message, 409);
  }
}

export class StaffForbiddenError extends StaffError {
  constructor() {
    super("Forbidden: insufficient rights for Staff", 403);
  }
}
