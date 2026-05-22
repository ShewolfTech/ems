// scripts/gen_Backend_Domain_Types.ts
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const domainsBase = path.resolve(__dirname, "../backend/src/domains");

// Convert snake_case to PascalCase
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
  const { pool } = await import(
    pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href
  );

  const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
  const content = await fs.readFile(kyselyFile, "utf-8");
  const interfaceMatches = [...content.matchAll(/export interface (\w+) {([^}]+)}/gs)];

  const interfaceMap = new Map<string, string>();
  for (const match of interfaceMatches) {
    const interfaceName = match[1];
    interfaceMap.set(interfaceName, interfaceName);
  }

  const result = await pool.query(`
    SELECT DISTINCT module, resource, route_type,
           COALESCE(BOOL_OR(is_global) FILTER (WHERE is_global IS TRUE), false) as is_global
    FROM route_permissions
    WHERE module IS NOT NULL AND resource IS NOT NULL
    GROUP BY module, resource, route_type
  `);

  console.log(`📡 Generating types for ${result.rows.length} domains...`);

  for (const { module, resource, route_type, is_global } of result.rows) {
    const isGlobal = is_global === true || is_global === 'true';
    if (["auth", "permissions"].includes(resource)) {
      console.log(`⏭️ Skipped: ${module}/${resource}`);
      continue;
    }

    const interfaceName = snakeToPascal(resource);

    if (!interfaceMap.has(interfaceName)) {
      console.warn(`⚠️ No interface found for ${resource} -> ${interfaceName} in kysely.generated.ts`);
      continue;
    }

    let domainPath;
    if (route_type === "view") {
      domainPath = path.join(domainsBase, module, "views", resource);
    } else if (route_type === "report") {
      domainPath = path.join(domainsBase, "reporting", resource);
    } else {
      domainPath = path.join(domainsBase, module, resource);
    }

    await ensureDir(domainPath);

    const typePath = path.join(domainPath, "types.ts");

    // For global resources, exclude school_id from create/update inputs
    let typeContent = `// Auto-generated from kysely.generated.ts
import type { ${interfaceName} } from "@ems/shared/db/kysely.generated.js";

/**
 * Represents the full ${interfaceName} record
 */
export type ${interfaceName}Type = ${interfaceName};
`;

    if (isGlobal) {
      // Global resources: exclude school_id from create/update inputs
      typeContent += `
/**
 * Represents the data required to create a new ${interfaceName} (global resource - no school_id)
 */
export type Create${interfaceName}Input = Omit<Partial<${interfaceName}Type>, 'school_id'>;

/**
 * Represents the data required to update an existing ${interfaceName} (global resource - no school_id)
 */
export type Update${interfaceName}Input = Omit<Partial<${interfaceName}Type>, 'school_id'>;
`;
    } else {
      typeContent += `
/**
 * Represents the data required to create a new ${interfaceName}
 */
export type Create${interfaceName}Input = Partial<${interfaceName}Type>;

/**
 * Represents the data required to update an existing ${interfaceName}
 */
export type Update${interfaceName}Input = Partial<${interfaceName}Type>;
`;
    }

    if (route_type === "report") {
      typeContent += `

/**
 * Represents the parameters accepted by the ${interfaceName} report
 * Adjust fields as needed for domain-specific filters
 */
export type ${interfaceName}ReportParams = {
  startDate?: string;
  endDate?: string;
  // Add domain-specific filters here, e.g. teacherId?: number;
};
`;
    }

    await fs.writeFile(typePath, typeContent, "utf-8");
    console.log(`✅ Types Generated: ${interfaceName} -> ${path.relative(domainsBase, typePath)}`);
  }

  await pool.end();
}

run().catch(console.error);
