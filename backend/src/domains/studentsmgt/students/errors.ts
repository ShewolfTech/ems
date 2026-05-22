/**
 * Custom Errors for Students
 * Auto-generated domain error classes
 */
export class StudentsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "StudentsError";
  }
}

export class StudentsNotFoundError extends StudentsError {
  constructor(id?: string | number) {
    super("Students record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class StudentsValidationError extends StudentsError {
  constructor(message?: string) {
    super(message || "Students validation failed", 400);
  }
}

export class StudentsUnauthorizedError extends StudentsError {
  constructor() {
    super("Unauthorized to perform this action on Students", 403);
  }
}

export class StudentsConflictError extends StudentsError {
  constructor(message: string = "Students conflict") {
    super(message, 409);
  }
}

export class StudentsForbiddenError extends StudentsError {
  constructor() {
    super("Forbidden: insufficient rights for Students", 403);
  }
}
