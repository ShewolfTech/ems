/**
 * Auto-generated error classes for RelationshipTypes
 */

export class RelationshipTypesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RelationshipTypesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RelationshipTypesValidationError);
    }
  }
}

export class RelationshipTypesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RelationshipTypesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RelationshipTypesServiceError);
    }
  }
}
