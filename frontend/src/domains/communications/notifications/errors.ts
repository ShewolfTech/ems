/**
 * Auto-generated error classes for Notifications
 */

export class NotificationsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotificationsValidationError);
    }
  }
}

export class NotificationsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotificationsServiceError);
    }
  }
}
