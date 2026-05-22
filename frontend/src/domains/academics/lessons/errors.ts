/**
 * Auto-generated error classes for Lessons
 */

export class LessonsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LessonsValidationError);
    }
  }
}

export class LessonsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LessonsServiceError);
    }
  }
}
