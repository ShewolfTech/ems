/**
 * Auto-generated error classes for Settings
 */

export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SettingsValidationError);
    }
  }
}

export class SettingsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SettingsServiceError);
    }
  }
}
