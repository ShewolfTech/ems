/**
 * Auto-generated error classes for Genders
 */

export class GendersValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GendersValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GendersValidationError);
    }
  }
}

export class GendersServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GendersServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GendersServiceError);
    }
  }
}
