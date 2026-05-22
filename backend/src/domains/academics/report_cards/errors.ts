/**
 * Custom Errors for ReportCards
 * Auto-generated domain error classes
 */
export class ReportCardsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ReportCardsError";
  }
}

export class ReportCardsNotFoundError extends ReportCardsError {
  constructor(id?: string | number) {
    super("ReportCards record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ReportCardsValidationError extends ReportCardsError {
  constructor(message?: string) {
    super(message || "ReportCards validation failed", 400);
  }
}

export class ReportCardsUnauthorizedError extends ReportCardsError {
  constructor() {
    super("Unauthorized to perform this action on ReportCards", 403);
  }
}

export class ReportCardsConflictError extends ReportCardsError {
  constructor(message: string = "ReportCards conflict") {
    super(message, 409);
  }
}

export class ReportCardsForbiddenError extends ReportCardsError {
  constructor() {
    super("Forbidden: insufficient rights for ReportCards", 403);
  }
}
