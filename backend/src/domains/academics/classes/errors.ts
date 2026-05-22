/**
 * Custom Errors for Classes
 * Auto-generated domain error classes
 */
export class ClassesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ClassesError";
  }
}

export class ClassesNotFoundError extends ClassesError {
  constructor(id?: string | number) {
    super("Classes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ClassesValidationError extends ClassesError {
  constructor(message?: string) {
    super(message || "Classes validation failed", 400);
  }
}

export class ClassesUnauthorizedError extends ClassesError {
  constructor() {
    super("Unauthorized to perform this action on Classes", 403);
  }
}

export class ClassesConflictError extends ClassesError {
  constructor(message: string = "Classes conflict") {
    super(message, 409);
  }
}

export class ClassesForbiddenError extends ClassesError {
  constructor() {
    super("Forbidden: insufficient rights for Classes", 403);
  }
}
