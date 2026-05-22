/**
 * Auto-generated error classes for StaffmgtRoles
 */

export class StaffmgtRolesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffmgtRolesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaffmgtRolesValidationError);
    }
  }
}

export class StaffmgtRolesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffmgtRolesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StaffmgtRolesServiceError);
    }
  }
}
