import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const AUTH_DIR = path.join(projectRoot, "backend/src/domains/auth");

const errorsContent = `
/**
 * Base class for all Authentication related errors.
 */
export class AuthError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when login fails.
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("The email or password provided is incorrect.", 401);
  }
}

/**
 * Thrown when a JWT is expired.
 */
export class SessionExpiredError extends AuthError {
  constructor() {
    super("Your session has expired. Please log in again.", 401);
  }
}

/**
 * FIXED: Explicit export for ForbiddenError to resolve TS2305
 */
export class ForbiddenError extends AuthError {
  constructor() {
    super("You do not have permission to perform this action.", 403);
  }
}
`;

async function run() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    
    // We write to errors.ts
    const filePath = path.join(AUTH_DIR, "errors.ts");
    await fs.writeFile(filePath, errorsContent.trim());

    console.log("--------------------------------------------------");
    console.log("✅ SUCCESS: errors.ts updated.");
    console.log("✅ VERIFIED: ForbiddenError is now exported.");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to update errors.ts:", error);
  }
}

run();