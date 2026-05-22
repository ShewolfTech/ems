import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const AUTH_DIR = path.join(projectRoot, "backend/src/domains/auth");

const configContent = `
/**
 * AUTH CONFIGURATION
 * Centralizes security settings for the Auth domain.
 */
export const AuthConfig = {
  // Use environment variable or a secure fallback for development
  jwtSecret: process.env.JWT_SECRET || "dev_secret_key_change_me_12345",
  
  // How long before the user is forced to log in again
  jwtExpiry: "24h",
  
  // Strength of the password encryption (higher = slower/more secure)
  saltRounds: 10,
  
  // Name of the cookie if using cookie-based sessions
  cookieName: "auth_session",
  
  // Professional Tip: Add domain-specific settings here
  minPasswordLength: 8,
};
`;

async function run() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    await fs.writeFile(path.join(AUTH_DIR, "config.ts"), configContent.trim());

    console.log("--------------------------------------------------");
    console.log("✅ Auth Config script generated.");
    console.log("   - JWT Secret & Expiry configured.");
    console.log("   - Salt Rounds set to 10.");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to generate config.ts:", error);
  }
}

run();