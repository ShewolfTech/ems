/**
 * Auto-generated error classes for Classes
 */

export class ClassesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClassesValidationError);
    }
  }
}

export class ClassesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClassesServiceError);
    }
  }
}
