/**
 * Auto-generated error classes for CustomFields
 */

export class CustomFieldsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomFieldsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomFieldsValidationError);
    }
  }
}

export class CustomFieldsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomFieldsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomFieldsServiceError);
    }
  }
}
