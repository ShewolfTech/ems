/**
 * Auto-generated error classes for GradeLevels
 */

export class GradeLevelsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeLevelsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GradeLevelsValidationError);
    }
  }
}

export class GradeLevelsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeLevelsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GradeLevelsServiceError);
    }
  }
}
