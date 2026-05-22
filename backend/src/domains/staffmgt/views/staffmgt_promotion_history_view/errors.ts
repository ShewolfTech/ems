/**
 * Custom Errors for StaffmgtPromotionHistoryView
 * Auto-generated domain error classes
 */
export class StaffmgtPromotionHistoryViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "StaffmgtPromotionHistoryViewError";
  }
}

export class StaffmgtPromotionHistoryViewNotFoundError extends StaffmgtPromotionHistoryViewError {
  constructor(id?: string | number) {
    super("StaffmgtPromotionHistoryView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class StaffmgtPromotionHistoryViewValidationError extends StaffmgtPromotionHistoryViewError {
  constructor(message?: string) {
    super(message || "StaffmgtPromotionHistoryView validation failed", 400);
  }
}

export class StaffmgtPromotionHistoryViewUnauthorizedError extends StaffmgtPromotionHistoryViewError {
  constructor() {
    super("Unauthorized to perform this action on StaffmgtPromotionHistoryView", 403);
  }
}

export class StaffmgtPromotionHistoryViewConflictError extends StaffmgtPromotionHistoryViewError {
  constructor(message: string = "StaffmgtPromotionHistoryView conflict") {
    super(message, 409);
  }
}

export class StaffmgtPromotionHistoryViewForbiddenError extends StaffmgtPromotionHistoryViewError {
  constructor() {
    super("Forbidden: insufficient rights for StaffmgtPromotionHistoryView", 403);
  }
}
