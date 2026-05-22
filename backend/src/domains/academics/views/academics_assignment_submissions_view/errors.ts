/**
 * Custom Errors for AcademicsAssignmentSubmissionsView
 * Auto-generated domain error classes
 */
export class AcademicsAssignmentSubmissionsViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AcademicsAssignmentSubmissionsViewError";
  }
}

export class AcademicsAssignmentSubmissionsViewNotFoundError extends AcademicsAssignmentSubmissionsViewError {
  constructor(id?: string | number) {
    super("AcademicsAssignmentSubmissionsView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AcademicsAssignmentSubmissionsViewValidationError extends AcademicsAssignmentSubmissionsViewError {
  constructor(message?: string) {
    super(message || "AcademicsAssignmentSubmissionsView validation failed", 400);
  }
}

export class AcademicsAssignmentSubmissionsViewUnauthorizedError extends AcademicsAssignmentSubmissionsViewError {
  constructor() {
    super("Unauthorized to perform this action on AcademicsAssignmentSubmissionsView", 403);
  }
}

export class AcademicsAssignmentSubmissionsViewConflictError extends AcademicsAssignmentSubmissionsViewError {
  constructor(message: string = "AcademicsAssignmentSubmissionsView conflict") {
    super(message, 409);
  }
}

export class AcademicsAssignmentSubmissionsViewForbiddenError extends AcademicsAssignmentSubmissionsViewError {
  constructor() {
    super("Forbidden: insufficient rights for AcademicsAssignmentSubmissionsView", 403);
  }
}
