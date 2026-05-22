/**
 * Custom Errors for SystemRolerouteAccessView
 * Auto-generated domain error classes
 */
export class SystemRolerouteAccessViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "SystemRolerouteAccessViewError";
  }
}

export class SystemRolerouteAccessViewNotFoundError extends SystemRolerouteAccessViewError {
  constructor(id?: string | number) {
    super("SystemRolerouteAccessView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class SystemRolerouteAccessViewValidationError extends SystemRolerouteAccessViewError {
  constructor(message?: string) {
    super(message || "SystemRolerouteAccessView validation failed", 400);
  }
}

export class SystemRolerouteAccessViewUnauthorizedError extends SystemRolerouteAccessViewError {
  constructor() {
    super("Unauthorized to perform this action on SystemRolerouteAccessView", 403);
  }
}

export class SystemRolerouteAccessViewConflictError extends SystemRolerouteAccessViewError {
  constructor(message: string = "SystemRolerouteAccessView conflict") {
    super(message, 409);
  }
}

export class SystemRolerouteAccessViewForbiddenError extends SystemRolerouteAccessViewError {
  constructor() {
    super("Forbidden: insufficient rights for SystemRolerouteAccessView", 403);
  }
}
