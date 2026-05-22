// src/types/errors.ts

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR";

export const ErrorCodes = {
  Unauthorized: "UNAUTHORIZED" as ErrorCode,
  Forbidden: "FORBIDDEN" as ErrorCode,
  NotFound: "NOT_FOUND" as ErrorCode,
  Validation: "VALIDATION_ERROR" as ErrorCode,
  Server: "SERVER_ERROR" as ErrorCode,
};

export type AppError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};
export class AppException extends Error {
  public code: ErrorCode;
  public details?: unknown;   
  constructor(error: AppError) {
    super(error.message);
    this.code = error.code; 
    this.details = error.details;
    Object.setPrototypeOf(this, AppException.prototype);
  } 
} 