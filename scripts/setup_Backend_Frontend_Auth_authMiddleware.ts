import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const MIDDLEWARE_FILE = path.join(projectRoot, "backend/src/domains/auth/authMiddleware.ts");

const content = `
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// FIXED: Match your actual file name and location (same directory)
import { AuthConfig } from './config.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // FIXED: Use AuthConfig.jwtSecret to match your config.ts
    const decoded = jwt.verify(token, AuthConfig.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
`;

async function run() {
  try {
    const dir = path.dirname(MIDDLEWARE_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(MIDDLEWARE_FILE, content.trim());
    
    console.log("--------------------------------------------------");
    console.log("✅ FIXED: authMiddleware.ts synchronized with AuthConfig");
    console.log("✅ Import: Corrected to './config'");
    console.log("✅ Property: Corrected to 'AuthConfig.jwtSecret'");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("❌ Failed to update middleware:", err);
    process.exit(1);
  }
}

run();