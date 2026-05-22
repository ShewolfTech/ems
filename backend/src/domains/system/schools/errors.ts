/**
 * Custom Errors for Schools
 * Auto-generated domain error classes
 */
export class SchoolsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "SchoolsError";
  }
}

export class SchoolsNotFoundError extends SchoolsError {
  constructor(id?: string | number) {
    super("Schools record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class SchoolsValidationError extends SchoolsError {
  constructor(message?: string) {
    super(message || "Schools validation failed", 400);
  }
}

export class SchoolsUnauthorizedError extends SchoolsError {
  constructor() {
    super("Unauthorized to perform this action on Schools", 403);
  }
}

export class SchoolsConflictError extends SchoolsError {
  constructor(message: string = "Schools conflict") {
    super(message, 409);
  }
}

export class SchoolsForbiddenError extends SchoolsError {
  constructor() {
    super("Forbidden: insufficient rights for Schools", 403);
  }
}
