/**
 * Custom Errors for Subjects
 * Auto-generated domain error classes
 */
export class SubjectsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "SubjectsError";
  }
}

export class SubjectsNotFoundError extends SubjectsError {
  constructor(id?: string | number) {
    super("Subjects record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class SubjectsValidationError extends SubjectsError {
  constructor(message?: string) {
    super(message || "Subjects validation failed", 400);
  }
}

export class SubjectsUnauthorizedError extends SubjectsError {
  constructor() {
    super("Unauthorized to perform this action on Subjects", 403);
  }
}

export class SubjectsConflictError extends SubjectsError {
  constructor(message: string = "Subjects conflict") {
    super(message, 409);
  }
}

export class SubjectsForbiddenError extends SubjectsError {
  constructor() {
    super("Forbidden: insufficient rights for Subjects", 403);
  }
}
