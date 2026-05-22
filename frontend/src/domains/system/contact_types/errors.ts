/**
 * Auto-generated error classes for ContactTypes
 */

export class ContactTypesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactTypesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContactTypesValidationError);
    }
  }
}

export class ContactTypesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactTypesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContactTypesServiceError);
    }
  }
}
