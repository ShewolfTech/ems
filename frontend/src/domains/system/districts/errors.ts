/**
 * Auto-generated error classes for Districts
 */

export class DistrictsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DistrictsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DistrictsValidationError);
    }
  }
}

export class DistrictsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DistrictsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DistrictsServiceError);
    }
  }
}
