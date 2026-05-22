/**
 * Custom Errors for Settings
 * Auto-generated domain error classes
 */
export class SettingsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "SettingsError";
  }
}

export class SettingsNotFoundError extends SettingsError {
  constructor(id?: string | number) {
    super("Settings record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class SettingsValidationError extends SettingsError {
  constructor(message?: string) {
    super(message || "Settings validation failed", 400);
  }
}

export class SettingsUnauthorizedError extends SettingsError {
  constructor() {
    super("Unauthorized to perform this action on Settings", 403);
  }
}

export class SettingsConflictError extends SettingsError {
  constructor(message: string = "Settings conflict") {
    super(message, 409);
  }
}

export class SettingsForbiddenError extends SettingsError {
  constructor() {
    super("Forbidden: insufficient rights for Settings", 403);
  }
}
