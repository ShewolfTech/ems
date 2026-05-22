export class AssessmentResultError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssessmentResultError";
  }
}

export class AssessmentResultNotFoundError extends AssessmentResultError {
  constructor(id?: string | number) {
    super("Assessment result" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssessmentResultValidationError extends AssessmentResultError {
  constructor(message?: string) {
    super(message || "Assessment result validation failed", 400);
  }
}
