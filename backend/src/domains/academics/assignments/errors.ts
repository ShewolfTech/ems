/**
 * Custom Errors for Assignments
 * Auto-generated domain error classes
 */
export class AssignmentsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssignmentsError";
  }
}

export class AssignmentsNotFoundError extends AssignmentsError {
  constructor(id?: string | number) {
    super("Assignments record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssignmentsValidationError extends AssignmentsError {
  constructor(message?: string) {
    super(message || "Assignments validation failed", 400);
  }
}

export class AssignmentsUnauthorizedError extends AssignmentsError {
  constructor() {
    super("Unauthorized to perform this action on Assignments", 403);
  }
}

export class AssignmentsConflictError extends AssignmentsError {
  constructor(message: string = "Assignments conflict") {
    super(message, 409);
  }
}

export class AssignmentsForbiddenError extends AssignmentsError {
  constructor() {
    super("Forbidden: insufficient rights for Assignments", 403);
  }
}
