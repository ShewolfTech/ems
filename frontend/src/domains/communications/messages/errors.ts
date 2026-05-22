/**
 * Auto-generated error classes for Messages
 */

export class MessagesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessagesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MessagesValidationError);
    }
  }
}

export class MessagesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessagesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MessagesServiceError);
    }
  }
}
