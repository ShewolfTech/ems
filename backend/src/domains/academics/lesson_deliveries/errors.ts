/**
 * Custom Errors for Lesson Deliveries
 */
export class LessonDeliveryError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LessonDeliveryError";
  }
}

export class LessonDeliveryNotFoundError extends LessonDeliveryError {
  constructor(id?: string | number) {
    super("Lesson delivery" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class LessonDeliveryValidationError extends LessonDeliveryError {
  constructor(message?: string) {
    super(message || "Lesson delivery validation failed", 400);
  }
}

export class LessonDeliveryUnauthorizedError extends LessonDeliveryError {
  constructor() {
    super("Unauthorized to perform this action on Lesson Delivery", 403);
  }
}

export class LessonDeliveryConflictError extends LessonDeliveryError {
  constructor(message: string = "Lesson delivery conflict") {
    super(message, 409);
  }
}

export class LessonDeliveryForbiddenError extends LessonDeliveryError {
  constructor() {
    super("Forbidden: insufficient rights for Lesson Delivery", 403);
  }
}

export class LessonNotFoundError extends LessonDeliveryError {
  constructor(id?: string | number) {
    super("Lesson" + (id ? " with ID " + id : "") + " not found", 404);
  }
}
