/**
 * Custom Errors for Webhooks
 * Auto-generated domain error classes
 */
export class WebhooksError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "WebhooksError";
  }
}

export class WebhooksNotFoundError extends WebhooksError {
  constructor(id?: string | number) {
    super("Webhooks record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class WebhooksValidationError extends WebhooksError {
  constructor(message?: string) {
    super(message || "Webhooks validation failed", 400);
  }
}

export class WebhooksUnauthorizedError extends WebhooksError {
  constructor() {
    super("Unauthorized to perform this action on Webhooks", 403);
  }
}

export class WebhooksConflictError extends WebhooksError {
  constructor(message: string = "Webhooks conflict") {
    super(message, 409);
  }
}

export class WebhooksForbiddenError extends WebhooksError {
  constructor() {
    super("Forbidden: insufficient rights for Webhooks", 403);
  }
}
