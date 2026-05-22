/**
 * Auto-generated error classes for Curricula
 */

export class CurriculaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurriculaValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CurriculaValidationError);
    }
  }
}

export class CurriculaServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurriculaServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CurriculaServiceError);
    }
  }
}
