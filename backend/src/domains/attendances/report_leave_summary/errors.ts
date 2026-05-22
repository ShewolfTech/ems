/**
 * Custom Errors for ReportLeaveSummary
 * Auto-generated domain error classes
 */
export class ReportLeaveSummaryError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ReportLeaveSummaryError";
  }
}

export class ReportLeaveSummaryNotFoundError extends ReportLeaveSummaryError {
  constructor(id?: string | number) {
    super("ReportLeaveSummary record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ReportLeaveSummaryValidationError extends ReportLeaveSummaryError {
  constructor(message?: string) {
    super(message || "ReportLeaveSummary validation failed", 400);
  }
}

export class ReportLeaveSummaryUnauthorizedError extends ReportLeaveSummaryError {
  constructor() {
    super("Unauthorized to perform this action on ReportLeaveSummary", 403);
  }
}

export class ReportLeaveSummaryConflictError extends ReportLeaveSummaryError {
  constructor(message: string = "ReportLeaveSummary conflict") {
    super(message, 409);
  }
}

export class ReportLeaveSummaryForbiddenError extends ReportLeaveSummaryError {
  constructor() {
    super("Forbidden: insufficient rights for ReportLeaveSummary", 403);
  }
}
