/**
 * Custom Errors for Lessons
 * Auto-generated domain error classes
 */
export class LessonsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LessonsError";
  }
}

export class LessonsNotFoundError extends LessonsError {
  constructor(id?: string | number) {
    super("Lessons record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class LessonsValidationError extends LessonsError {
  constructor(message?: string) {
    super(message || "Lessons validation failed", 400);
  }
}

export class LessonsUnauthorizedError extends LessonsError {
  constructor() {
    super("Unauthorized to perform this action on Lessons", 403);
  }
}

export class LessonsConflictError extends LessonsError {
  constructor(message: string = "Lessons conflict") {
    super(message, 409);
  }
}

export class LessonsForbiddenError extends LessonsError {
  constructor() {
    super("Forbidden: insufficient rights for Lessons", 403);
  }
}
