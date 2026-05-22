export class LessonDeliveryError extends Error {
  constructor(public message: string, public statusCode?: number) {
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
