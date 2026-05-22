/**
 * Custom Errors for Exams
 * Auto-generated domain error classes
 */
export class ExamsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ExamsError";
  }
}

export class ExamsNotFoundError extends ExamsError {
  constructor(id?: string | number) {
    super("Exams record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ExamsValidationError extends ExamsError {
  constructor(message?: string) {
    super(message || "Exams validation failed", 400);
  }
}

export class ExamsUnauthorizedError extends ExamsError {
  constructor() {
    super("Unauthorized to perform this action on Exams", 403);
  }
}

export class ExamsConflictError extends ExamsError {
  constructor(message: string = "Exams conflict") {
    super(message, 409);
  }
}

export class ExamsForbiddenError extends ExamsError {
  constructor() {
    super("Forbidden: insufficient rights for Exams", 403);
  }
}
