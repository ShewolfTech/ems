/**
 * Auto-generated error classes for Assets
 */

export class AssetsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetsValidationError);
    }
  }
}

export class AssetsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetsServiceError);
    }
  }
}
