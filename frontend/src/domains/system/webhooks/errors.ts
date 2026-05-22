/**
 * Auto-generated error classes for Webhooks
 */

export class WebhooksValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhooksValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebhooksValidationError);
    }
  }
}

export class WebhooksServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhooksServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebhooksServiceError);
    }
  }
}
