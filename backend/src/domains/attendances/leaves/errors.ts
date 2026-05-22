/**
 * Custom Errors for Leaves
 * Auto-generated domain error classes
 */
export class LeavesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LeavesError";
  }
}

export class LeavesNotFoundError extends LeavesError {
  constructor(id?: string | number) {
    super("Leaves record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class LeavesValidationError extends LeavesError {
  constructor(message?: string) {
    super(message || "Leaves validation failed", 400);
  }
}

export class LeavesUnauthorizedError extends LeavesError {
  constructor() {
    super("Unauthorized to perform this action on Leaves", 403);
  }
}

export class LeavesConflictError extends LeavesError {
  constructor(message: string = "Leaves conflict") {
    super(message, 409);
  }
}

export class LeavesForbiddenError extends LeavesError {
  constructor() {
    super("Forbidden: insufficient rights for Leaves", 403);
  }
}
