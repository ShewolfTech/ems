/**
 * Custom Errors for AcademicsClassscheduleView
 * Auto-generated domain error classes
 */
export class AcademicsClassscheduleViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AcademicsClassscheduleViewError";
  }
}

export class AcademicsClassscheduleViewNotFoundError extends AcademicsClassscheduleViewError {
  constructor(id?: string | number) {
    super("AcademicsClassscheduleView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AcademicsClassscheduleViewValidationError extends AcademicsClassscheduleViewError {
  constructor(message?: string) {
    super(message || "AcademicsClassscheduleView validation failed", 400);
  }
}

export class AcademicsClassscheduleViewUnauthorizedError extends AcademicsClassscheduleViewError {
  constructor() {
    super("Unauthorized to perform this action on AcademicsClassscheduleView", 403);
  }
}

export class AcademicsClassscheduleViewConflictError extends AcademicsClassscheduleViewError {
  constructor(message: string = "AcademicsClassscheduleView conflict") {
    super(message, 409);
  }
}

export class AcademicsClassscheduleViewForbiddenError extends AcademicsClassscheduleViewError {
  constructor() {
    super("Forbidden: insufficient rights for AcademicsClassscheduleView", 403);
  }
}
