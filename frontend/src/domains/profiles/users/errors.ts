/**
 * Auto-generated error classes for Users
 */

export class UsersValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsersValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UsersValidationError);
    }
  }
}

export class UsersServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsersServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UsersServiceError);
    }
  }
}
