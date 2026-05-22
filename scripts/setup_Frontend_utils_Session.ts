import { promises as fs } from "node:fs";
import path from "node:path";

const UTILS_DIR = path.resolve("frontend/src/utils");

const content = `
const TOKEN_KEY = 'auth_token';

export const sessionUtils = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  /**
   * Generates headers for fetch requests
   */
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { 'Authorization': \`Bearer \${token}\` } : {};
  }
};
`;

async function run() {
  await fs.mkdir(UTILS_DIR, { recursive: true });
  await fs.writeFile(path.join(UTILS_DIR, "session.ts"), content.trim());
  console.log("✅ Generated: utils/session.ts");
}
run();