/**
 * Custom Errors for AcademicsStudentsgradesView
 * Auto-generated domain error classes
 */
export class AcademicsStudentsgradesViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AcademicsStudentsgradesViewError";
  }
}

export class AcademicsStudentsgradesViewNotFoundError extends AcademicsStudentsgradesViewError {
  constructor(id?: string | number) {
    super("AcademicsStudentsgradesView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AcademicsStudentsgradesViewValidationError extends AcademicsStudentsgradesViewError {
  constructor(message?: string) {
    super(message || "AcademicsStudentsgradesView validation failed", 400);
  }
}

export class AcademicsStudentsgradesViewUnauthorizedError extends AcademicsStudentsgradesViewError {
  constructor() {
    super("Unauthorized to perform this action on AcademicsStudentsgradesView", 403);
  }
}

export class AcademicsStudentsgradesViewConflictError extends AcademicsStudentsgradesViewError {
  constructor(message: string = "AcademicsStudentsgradesView conflict") {
    super(message, 409);
  }
}

export class AcademicsStudentsgradesViewForbiddenError extends AcademicsStudentsgradesViewError {
  constructor() {
    super("Forbidden: insufficient rights for AcademicsStudentsgradesView", 403);
  }
}
