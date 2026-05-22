/**
 * Custom Errors for Objects
 * Auto-generated domain error classes
 */
export class ObjectsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ObjectsError";
  }
}

export class ObjectsNotFoundError extends ObjectsError {
  constructor(id?: string | number) {
    super("Objects record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ObjectsValidationError extends ObjectsError {
  constructor(message?: string) {
    super(message || "Objects validation failed", 400);
  }
}

export class ObjectsUnauthorizedError extends ObjectsError {
  constructor() {
    super("Unauthorized to perform this action on Objects", 403);
  }
}

export class ObjectsConflictError extends ObjectsError {
  constructor(message: string = "Objects conflict") {
    super(message, 409);
  }
}

export class ObjectsForbiddenError extends ObjectsError {
  constructor() {
    super("Forbidden: insufficient rights for Objects", 403);
  }
}
