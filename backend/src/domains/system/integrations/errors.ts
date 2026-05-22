/**
 * Custom Errors for Integrations
 * Auto-generated domain error classes
 */
export class IntegrationsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "IntegrationsError";
  }
}

export class IntegrationsNotFoundError extends IntegrationsError {
  constructor(id?: string | number) {
    super("Integrations record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class IntegrationsValidationError extends IntegrationsError {
  constructor(message?: string) {
    super(message || "Integrations validation failed", 400);
  }
}

export class IntegrationsUnauthorizedError extends IntegrationsError {
  constructor() {
    super("Unauthorized to perform this action on Integrations", 403);
  }
}

export class IntegrationsConflictError extends IntegrationsError {
  constructor(message: string = "Integrations conflict") {
    super(message, 409);
  }
}

export class IntegrationsForbiddenError extends IntegrationsError {
  constructor() {
    super("Forbidden: insufficient rights for Integrations", 403);
  }
}
