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