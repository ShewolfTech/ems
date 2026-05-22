/**
 * Auto-generated error classes for StaffmgtPromotionHistoryView
 */

export class StaffmgtPromotionHistoryViewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffmgtPromotionHistoryViewValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaffmgtPromotionHistoryViewValidationError);
    }
  }
}

export class StaffmgtPromotionHistoryViewServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffmgtPromotionHistoryViewServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaffmgtPromotionHistoryViewServiceError);
    }
  }
}
