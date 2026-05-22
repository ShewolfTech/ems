/**
 * Auto-generated error classes for ApiKeys
 */

export class ApiKeysValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeysValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiKeysValidationError);
    }
  }
}

export class ApiKeysServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeysServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiKeysServiceError);
    }
  }
}
