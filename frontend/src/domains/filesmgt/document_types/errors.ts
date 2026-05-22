/**
 * Auto-generated error classes for DocumentTypes
 */

export class DocumentTypesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentTypesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DocumentTypesValidationError);
    }
  }
}

export class DocumentTypesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentTypesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DocumentTypesServiceError);
    }
  }
}
