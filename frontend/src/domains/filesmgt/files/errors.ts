/**
 * Auto-generated error classes for Files
 */

export class FilesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FilesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilesValidationError);
    }
  }
}

export class FilesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FilesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilesServiceError);
    }
  }
}
