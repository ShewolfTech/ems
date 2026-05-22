/**
 * Auto-generated error classes for Leaves
 */

export class LeavesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeavesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LeavesValidationError);
    }
  }
}

export class LeavesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeavesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LeavesServiceError);
    }
  }
}
