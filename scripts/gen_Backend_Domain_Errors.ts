// scripts/gen_Backend_Domain_Errors.ts
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const domainsBase = path.resolve(__dirname, "../backend/src/domains");

const snakeToPascal = (str: string) =>
  str.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function run() {
  const { pool } = await import(
    pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href
  );

  const result = await pool.query(`
    SELECT DISTINCT module, resource, route_type,
           COALESCE(BOOL_OR(is_global) FILTER (WHERE is_global IS TRUE), false) as is_global
    FROM route_permissions
    WHERE module IS NOT NULL AND resource IS NOT NULL
    GROUP BY module, resource, route_type
  `);

  console.log(`📡 Generating errors for ${result.rows.length} domains...`);

  for (const { module, resource, route_type } of result.rows) {
    if (["auth", "permissions"].includes(resource)) {
      console.log(`⏭️ Skipped: ${module}/${resource}`);
      continue;
    }

    const interfaceName = snakeToPascal(resource);

    let domainPath;
    if (route_type === "view") {
      domainPath = path.join(domainsBase, module, "views", resource);
    } else if (route_type === "report") {
      domainPath = path.join(domainsBase, "reporting", resource);
    } else {
      domainPath = path.join(domainsBase, module, resource);
    }

    await ensureDir(domainPath);

    const errorsPath = path.join(domainPath, "errors.ts");
    const errorsContent = `/**
 * Custom Errors for ${interfaceName}
 * Auto-generated domain error classes
 */
export class ${interfaceName}Error extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "${interfaceName}Error";
  }
}

export class ${interfaceName}NotFoundError extends ${interfaceName}Error {
  constructor(id?: string | number) {
    super("${interfaceName} record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ${interfaceName}ValidationError extends ${interfaceName}Error {
  constructor(message?: string) {
    super(message || "${interfaceName} validation failed", 400);
  }
}

export class ${interfaceName}UnauthorizedError extends ${interfaceName}Error {
  constructor() {
    super("Unauthorized to perform this action on ${interfaceName}", 403);
  }
}

export class ${interfaceName}ConflictError extends ${interfaceName}Error {
  constructor(message: string = "${interfaceName} conflict") {
    super(message, 409);
  }
}

export class ${interfaceName}ForbiddenError extends ${interfaceName}Error {
  constructor() {
    super("Forbidden: insufficient rights for ${interfaceName}", 403);
  }
}
`;

    await fs.writeFile(errorsPath, errorsContent, "utf-8");
    console.log(`✅ Errors Generated: ${interfaceName} -> ${path.relative(domainsBase, errorsPath)}`);
  }

  await pool.end();
  console.log("\n🎉 Errors generation complete.");
}

run().catch(console.error);
