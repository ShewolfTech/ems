/**
 * Auto-generated error classes for SystemRolerouteAccessView
 */

export class SystemRolerouteAccessViewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SystemRolerouteAccessViewValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SystemRolerouteAccessViewValidationError);
    }
  }
}

export class SystemRolerouteAccessViewServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SystemRolerouteAccessViewServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SystemRolerouteAccessViewServiceError);
    }
  }
}
