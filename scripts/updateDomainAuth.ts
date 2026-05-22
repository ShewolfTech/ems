// 📁 scripts/updateDomainAuth.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env for DB access
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const domainPath = path.resolve(__dirname, "../backend/src/domains/auth");

const requiredFiles = [
  "controller.ts",
  "service.ts",
  "models.ts",
  "validator.ts",
  "errors.ts",
  "routes.ts",
  "authMiddleware.ts",
  "barrel.ts",
];

// --- Boilerplate generators ---
function generateController() {
  return `import { Request, Response } from "express";
import { AuthService } from "./service.js";
import { validateLogin } from "./validator.js";

const service = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    if (!validateLogin(req.body)) {
      return res.status(400).json({ error: "Invalid login payload. Ensure schoolId is a number." });
    }
    const session = await service.login(req.body);
    res.json(session);
  }

  async logout(req: Request, res: Response) {
    await service.logout(req.params.sessionId);
    res.status(204).send();
  }

  async me(req: Request, res: Response) {
    const user = await service.getUserFromSession(req.params.sessionId);
    res.json(user);
  }
}`;
}

function generateService() {
  return `import { pool } from "../../config/infra/database.js";
import { UserModel, SessionModel } from "./models.js";
import { InvalidCredentialsError } from "./errors.js";

export class AuthService {
  async login(data: { email: string; password: string; schoolId: number }): Promise<SessionModel> {
    const userResult = await pool.query(
      "SELECT id, role_id FROM auth.users WHERE email = $1 AND school_id = $2",
      [data.email, data.schoolId]
    );

    if (userResult.rowCount === 0) throw new InvalidCredentialsError();
    const { id: userId, role_id } = userResult.rows[0];

    // Fetch permissions for this role
    const permsResult = await pool.query(
      \`SELECT rp.module, rp.resource, rp.action
       FROM route_permissions rp
       JOIN role_permissions r ON rp.permission_id = r.permission_id
       WHERE r.role_id = $1 AND rp.is_active = true\`,
      [role_id]
    );

    const permissions = permsResult.rows.map(
      (row: any) => \`\${row.module}:\${row.resource}:\${row.action}\`
    );

    const sessionResult = await pool.query(
      "INSERT INTO auth.sessions (user_id, school_id, permissions) VALUES ($1, $2, $3) RETURNING *",
      [userId, data.schoolId, JSON.stringify(permissions)]
    );

    return sessionResult.rows[0];
  }

  async logout(sessionId: string): Promise<void> {
    await pool.query("DELETE FROM auth.sessions WHERE id = $1", [sessionId]);
  }

  async getUserFromSession(sessionId: string): Promise<UserModel | null> {
    const result = await pool.query(
      "SELECT u.* FROM auth.users u JOIN auth.sessions s ON u.id = s.user_id WHERE s.id = $1 AND u.school_id = s.school_id",
      [sessionId]
    );
    return result.rows[0] ?? null;
  }
}`;
}

function generateModels() {
  return `// Auto-generated from kysely.generated.ts
import { AuthUsers, AuthSessions, AuthIdentities } from "../../db/kysely.generated.js";

export type UserModel = AuthUsers;
export type SessionModel = AuthSessions;
export type IdentityModel = AuthIdentities;`;
}

function generateValidator() {
  return `export function validateLogin(input: any): input is { email: string; password: string; schoolId: number } {
  return (
    typeof input.email === "string" &&
    typeof input.password === "string" &&
    typeof input.schoolId === "number"
  );
}`;
}

function generateErrors() {
  return `export class AuthError extends Error { constructor(m: string) { super(m); this.name = "AuthError"; } }
export class InvalidCredentialsError extends AuthError { constructor() { super("Invalid email or password"); } }
export class SessionExpiredError extends AuthError { constructor() { super("Session expired"); } }`;
}

function generateRoutes() {
  return `import { Router } from "express";
import { AuthController } from "./controller.js";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login.bind(controller));
router.post("/logout/:sessionId", controller.logout.bind(controller));
router.get("/me/:sessionId", controller.me.bind(controller));

export default router;`;
}

function generateAuthMiddleware() {
  return `import { Request, Response, NextFunction } from "express";
import { Permissions } from "../../registries/permissions/permissionsEnum.js";
import { permissionRegistry } from "../../registries/permissions/permissionRegistry.js";

export function requirePermission(module: string, resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions: string[] = req.user?.permissions ?? [];

    const required = \`\${module}:\${resource}:\${action}\`;
    if (!userPermissions.includes(required)) {
      return res.status(403).json({ error: "Forbidden: missing permission" });
    }

    next();
  };
}`;
}

function regenerateBarrel(domainPath: string) {
  const exports = [
    'export * from "./controller.js";',
    'export * from "./service.js";',
    'export { default as routes } from "./routes.js";',
    'export * from "./models.js";',
    'export * from "./validator.js";',
    'export * from "./errors.js";',
    'export * from "./authMiddleware.js";',
  ];
  fs.writeFileSync(path.join(domainPath, "barrel.ts"), exports.join("\n") + "\n");
  console.log("🔄 Regenerated barrel.ts with .js extensions");
}

// --- Main ---
async function main() {
  console.log("🚀 Updating auth domain...");

  if (!fs.existsSync(domainPath)) {
    fs.mkdirSync(domainPath, { recursive: true });
    console.log("📁 Created folder: auth");
  }

  const generators: Record<string, () => string> = {
    "controller.ts": generateController,
    "service.ts": generateService,
    "models.ts": generateModels,
    "validator.ts": generateValidator,
    "errors.ts": generateErrors,
    "routes.ts": generateRoutes,
    "authMiddleware.ts": generateAuthMiddleware,
  };

  for (const file of requiredFiles) {
    const filePath = path.join(domainPath, file);

    if (file === "barrel.ts") {
      regenerateBarrel(domainPath);
      continue;
    }

    const content = generators[file]?.() ?? `// ${file} for auth domain\n`;
    fs.writeFileSync(filePath, content);
    console.log(`  ✨ Updated: ${file}`);
  }

  console.log("✅ Auth domain fully scaffolded.");
}

main().catch((err) => {
  console.error("❌ Error updating auth domain:", err);
  process.exit(1);
});
