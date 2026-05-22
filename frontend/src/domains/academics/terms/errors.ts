/**
 * Auto-generated error classes for Terms
 */

export class TermsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TermsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TermsValidationError);
    }
  }
}

export class TermsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TermsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TermsServiceError);
    }
  }
}
