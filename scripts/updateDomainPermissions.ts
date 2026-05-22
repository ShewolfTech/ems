// 📁 scripts/updateDomainPermissions.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env for DB access (if needed by service boilerplate)
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const domainPath = path.resolve(__dirname, "../backend/src/domains/permissions");

const requiredFiles = [
  "controller.ts",
  "service.ts",
  "models.ts",
  "types.ts",
  "validator.ts",
  "errors.ts",
  "routes.ts",
  "barrel.ts",
];

// --- Boilerplate generators ---
function generateController() {
  return `import { Request, Response } from "express";
import { PermissionService } from "./service.js";
import { validatePermission } from "./validator.js";

const service = new PermissionService();

export class PermissionController {
  async list(req: Request, res: Response) {
    const permissions = await service.getAllPermissions();
    res.json(permissions);
  }

  async create(req: Request, res: Response) {
    if (!validatePermission(req.body)) {
      return res.status(400).json({ error: "Invalid permission payload" });
    }
    const permission = await service.createPermission(req.body);
    res.status(201).json(permission);
  }

  async delete(req: Request, res: Response) {
    try {
      await service.deletePermission(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }
}`;
}

function generateService() {
  return `import { pool } from "../../config/infra/database.js";
import { PermissionModel } from "./models.js";

export class PermissionService {
  async getAllPermissions(): Promise<PermissionModel[]> {
    const result = await pool.query("SELECT * FROM routePermissions WHERE is_active = true");
    return result.rows;
  }

  async createPermission(data: PermissionModel): Promise<PermissionModel> {
    const result = await pool.query(
      "INSERT INTO routePermissions (route, method, action, module, resource, permissionId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [data.route, data.method, data.action, data.module, data.resource, data.permissionId]
    );
    return result.rows[0];
  }

  async deletePermission(id: string): Promise<void> {
    const result = await pool.query("DELETE FROM routePermissions WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      throw new Error("Permission not found");
    }
  }
}`;
}

function generateModels() {
  return `// Auto-generated from kysely.generated.ts
import { DB } from "../../db/kysely.generated.js";

export type PermissionModel = DB["routePermissions"];`;
}

function generateTypes() {
  return `// Auto-generated from kysely.generated.ts
import { DB } from "../../db/kysely.generated.js";

export type PermissionType = DB["routePermissions"];`;

}

function generateValidator() {
  return `import { PermissionType } from "./types.js";

export function validatePermission(input: any): input is PermissionType {
  return (
    typeof input.route === "string" &&
    typeof input.method === "string" &&
    typeof input.action === "string" &&
    typeof input.module === "string" &&
    typeof input.resource === "string"
  );
}`;
}

function generateErrors() {
  return `export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export class PermissionNotFoundError extends PermissionError {
  constructor(id: string) {
    super(\`Permission with id \${id} not found\`);
  }
}`;
}

function generateRoutes() {
  return `import { Router } from "express";
import { PermissionController } from "./controller.js";

const router = Router();
const controller = new PermissionController();

router.get("/", controller.list.bind(controller));
router.post("/", controller.create.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;`;
}

function regenerateBarrel(domainPath: string) {
  const exports = [
    `export * from "./controller.js";`,
    `export * from "./service.js";`,
    `export { default as routes } from "./routes.js";`,
    `export * from "./models.js";`,
    `export * from "./types.js";`,
    `export * from "./validator.js";`,
    `export * from "./errors.js";`,
  ];
  fs.writeFileSync(path.join(domainPath, "barrel.ts"), exports.join("\n") + "\n");
  console.log("🔄 Regenerated barrel.ts with .js extensions");
}

// --- Main ---
async function main() {
  console.log("🚀 Updating permissions domain...");

  if (!fs.existsSync(domainPath)) {
    fs.mkdirSync(domainPath, { recursive: true });
    console.log("📁 Created folder: permissions");
  }

  const generators: Record<string, () => string> = {
    "controller.ts": generateController,
    "service.ts": generateService,
    "models.ts": generateModels,
    "types.ts": generateTypes,
    "validator.ts": generateValidator,
    "errors.ts": generateErrors,
    "routes.ts": generateRoutes,
  };

  for (const file of requiredFiles) {
    const filePath = path.join(domainPath, file);

    if (file === "barrel.ts") {
      regenerateBarrel(domainPath);
      continue;
    }

    const content = generators[file]?.() ?? `// ${file} for permissions domain\n`;
    fs.writeFileSync(filePath, content);
    console.log(`  ✨ Updated: ${file}`);
  }

  console.log("✅ Permissions domain fully scaffolded.");
}

main().catch((err) => {
  console.error("❌ Error updating permissions domain:", err);
  process.exit(1);
});
