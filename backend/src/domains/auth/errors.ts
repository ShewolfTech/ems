/**
 * Base class for all Authentication related errors.
 */
export class AuthError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when login fails.
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("The email or password provided is incorrect.", 401);
  }
}

/**
 * Thrown when a JWT is expired.
 */
export class SessionExpiredError extends AuthError {
  constructor() {
    super("Your session has expired. Please log in again.", 401);
  }
}

/**
 * FIXED: Explicit export for ForbiddenError to resolve TS2305
 */
export class ForbiddenError extends AuthError {
  constructor() {
    super("You do not have permission to perform this action.", 403);
  }
}