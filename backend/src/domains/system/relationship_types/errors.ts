/**
 * Custom Errors for RelationshipTypes
 * Auto-generated domain error classes
 */
export class RelationshipTypesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "RelationshipTypesError";
  }
}

export class RelationshipTypesNotFoundError extends RelationshipTypesError {
  constructor(id?: string | number) {
    super("RelationshipTypes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class RelationshipTypesValidationError extends RelationshipTypesError {
  constructor(message?: string) {
    super(message || "RelationshipTypes validation failed", 400);
  }
}

export class RelationshipTypesUnauthorizedError extends RelationshipTypesError {
  constructor() {
    super("Unauthorized to perform this action on RelationshipTypes", 403);
  }
}

export class RelationshipTypesConflictError extends RelationshipTypesError {
  constructor(message: string = "RelationshipTypes conflict") {
    super(message, 409);
  }
}

export class RelationshipTypesForbiddenError extends RelationshipTypesError {
  constructor() {
    super("Forbidden: insufficient rights for RelationshipTypes", 403);
  }
}
