/**
 * Custom Errors for Files
 * Auto-generated domain error classes
 */
export class FilesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "FilesError";
  }
}

export class FilesNotFoundError extends FilesError {
  constructor(id?: string | number) {
    super("Files record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class FilesValidationError extends FilesError {
  constructor(message?: string) {
    super(message || "Files validation failed", 400);
  }
}

export class FilesUnauthorizedError extends FilesError {
  constructor() {
    super("Unauthorized to perform this action on Files", 403);
  }
}

export class FilesConflictError extends FilesError {
  constructor(message: string = "Files conflict") {
    super(message, 409);
  }
}

export class FilesForbiddenError extends FilesError {
  constructor() {
    super("Forbidden: insufficient rights for Files", 403);
  }
}
