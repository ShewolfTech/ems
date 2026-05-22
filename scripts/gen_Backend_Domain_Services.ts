// scripts/gen_Backend_Domain_Services.ts
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const domainsBase = path.resolve(__dirname, "../backend/src/domains");
const backendSrc = path.resolve(__dirname, "../backend/src");

const snakeToPascal = (str: string) =>
  str
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function run() {
  const dbModulePath = pathToFileURL(
    path.resolve(__dirname, "../shared/src/db/database.ts"),
  ).href;
  const { pool } = await import(dbModulePath);

  const result = await pool.query(`
    SELECT module, resource, route_type, 
           COALESCE(BOOL_OR(is_global) FILTER (WHERE is_global IS TRUE), false) as is_global
    FROM route_permissions
    WHERE module IS NOT NULL AND resource IS NOT NULL
    GROUP BY module, resource, route_type
  `);

  console.log(`📡 Generating Multi-Tenant services for ${result.rows.length} domains...`);

  for (const { module, resource, route_type, is_global } of result.rows) {
    if (["auth", "permissions"].includes(resource)) continue;

    const interfaceName = snakeToPascal(resource);
    const serviceInstance = `${resource.replace(/[^a-zA-Z0-9]/g, "")}Service`;
    
    // 🛡️ Kysely uses camelCase property names which map to snake_case DB columns automatically
    const schoolCol = "schoolId";
    
    // Determine if this is a global resource (no tenant isolation needed)
    const isGlobal = is_global === true || is_global === 1 || is_global === 'true' || is_global === '1';

    let domainPath =
      route_type === "view"
        ? path.join(domainsBase, module, "views", resource)
        : route_type === "report"
          ? path.join(domainsBase, "reporting", resource)
          : path.join(domainsBase, module, resource);

    await ensureDir(domainPath);

    const relativePath = path
      .relative(domainPath, backendSrc)
      .replace(/\\/g, "/");
    const dbImportPath = `${relativePath}/config/infra/database.js`;

    let imports = `import { db } from "${dbImportPath}";\n`;
    if (route_type === "crud" && !isGlobal) {
      imports += `import { ${interfaceName}Schema } from "./validator.js";\n`;
    }
    imports += `import { ${interfaceName}Type } from "./types.js";\n`;

    // Generate service content based on route_type and is_global
    let serviceContent = `// ⚠️ Auto-generated Multi-Tenant Service for ${interfaceName}
${imports}

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ${interfaceName}Service {
`;

    if (isGlobal) {
      // Global resources - no school_id filtering
      serviceContent += `  async findAll(context: UserContext, params?: any) {
    return await db
      .selectFrom("${resource}" as any)
      .selectAll()
      .execute();
  }

  async findById(context: UserContext, id: number | string) {
    return await db
      .selectFrom("${resource}" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .executeTakeFirst();
  }
`;
    } else {
      // Tenant-specific resources - filter by school_id
      serviceContent += `  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("${resource}" as any)
      .selectAll()
      .where("${schoolCol}" as any, "=", context.schoolId as any);
`;

      // Only add is_deleted filter for CRUD (not for views)
      if (route_type !== "view") {
        serviceContent += `    query = query.where("is_deleted" as any, "=", false);\n`;
      }
      
      serviceContent += `    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("${resource}" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("${schoolCol}" as any, "=", context.schoolId as any);
`;

      // Only add is_deleted filter for CRUD (not for views)
      if (route_type !== "view") {
        serviceContent += `    query = query.where("is_deleted" as any, "=", false);\n`;
      }
      
      serviceContent += `    return await query.executeTakeFirst();
  }
`;
    }

    if (route_type === "crud" && !isGlobal) {
      serviceContent += `
  async create(context: UserContext, data: ${interfaceName}Type) {
    const validated = ${interfaceName}Schema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("${resource}" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<${interfaceName}Type>) {
    return await db.updateTable("${resource}" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("${resource}" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
`;
    } else if (route_type === "report") {
      serviceContent += `
  async generate(context: UserContext, params: any) {
    return await db.selectFrom("${resource}" as any)
      .selectAll()
      .where("${schoolCol}" as any, "=", context.schoolId as any)
      .execute();
  }
`;
    }

    // Custom endpoints for leaves resource
    if (resource === "leaves") {
      serviceContent += `
  async getApprovers(context: UserContext) {
    // Get active users in the school who can be approvers
    return await db
      .selectFrom("users" as any)
      .select(["id", "firstName", "lastName", "email"])
      .where("schoolId" as any, "=", context.schoolId as any)
      .where("isActive" as any, "=", true)
      .where("isDeleted" as any, "=", false)
      .execute();
  }
`;
    }

    serviceContent += `}
export const ${serviceInstance} = new ${interfaceName}Service();\n`;
    await fs.writeFile(
      path.join(domainPath, "service.ts"),
      serviceContent,
      "utf-8",
    );
  }

  console.log("✅ Multi-tenant isolation applied to all Services.");
  await pool.end();
}

run().catch(console.error);
