/**
 * Custom Errors for Notifications
 * Auto-generated domain error classes
 */
export class NotificationsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "NotificationsError";
  }
}

export class NotificationsNotFoundError extends NotificationsError {
  constructor(id?: string | number) {
    super("Notifications record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class NotificationsValidationError extends NotificationsError {
  constructor(message?: string) {
    super(message || "Notifications validation failed", 400);
  }
}

export class NotificationsUnauthorizedError extends NotificationsError {
  constructor() {
    super("Unauthorized to perform this action on Notifications", 403);
  }
}

export class NotificationsConflictError extends NotificationsError {
  constructor(message: string = "Notifications conflict") {
    super(message, 409);
  }
}

export class NotificationsForbiddenError extends NotificationsError {
  constructor() {
    super("Forbidden: insufficient rights for Notifications", 403);
  }
}
