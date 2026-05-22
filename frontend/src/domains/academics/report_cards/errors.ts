/**
 * Auto-generated error classes for ReportCards
 */

export class ReportCardsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportCardsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReportCardsValidationError);
    }
  }
}

export class ReportCardsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportCardsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReportCardsServiceError);
    }
  }
}
