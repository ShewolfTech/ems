/**
 * Custom Errors for Messages
 * Auto-generated domain error classes
 */
export class MessagesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "MessagesError";
  }
}

export class MessagesNotFoundError extends MessagesError {
  constructor(id?: string | number) {
    super("Messages record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class MessagesValidationError extends MessagesError {
  constructor(message?: string) {
    super(message || "Messages validation failed", 400);
  }
}

export class MessagesUnauthorizedError extends MessagesError {
  constructor() {
    super("Unauthorized to perform this action on Messages", 403);
  }
}

export class MessagesConflictError extends MessagesError {
  constructor(message: string = "Messages conflict") {
    super(message, 409);
  }
}

export class MessagesForbiddenError extends MessagesError {
  constructor() {
    super("Forbidden: insufficient rights for Messages", 403);
  }
}
