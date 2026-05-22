/**
 * Custom Errors for LeaveTypes
 * Auto-generated domain error classes
 */
export class LeaveTypesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LeaveTypesError";
  }
}

export class LeaveTypesNotFoundError extends LeaveTypesError {
  constructor(id?: string | number) {
    super("LeaveTypes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class LeaveTypesValidationError extends LeaveTypesError {
  constructor(message?: string) {
    super(message || "LeaveTypes validation failed", 400);
  }
}

export class LeaveTypesUnauthorizedError extends LeaveTypesError {
  constructor() {
    super("Unauthorized to perform this action on LeaveTypes", 403);
  }
}

export class LeaveTypesConflictError extends LeaveTypesError {
  constructor(message: string = "LeaveTypes conflict") {
    super(message, 409);
  }
}

export class LeaveTypesForbiddenError extends LeaveTypesError {
  constructor() {
    super("Forbidden: insufficient rights for LeaveTypes", 403);
  }
}
