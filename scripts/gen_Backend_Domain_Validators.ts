import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const SYSTEM_FIELDS = new Set([
  "id",
  "school_id",
  "user_id",
  "created_at",
  "updated_at",
  "deleted_at",
  "created_by",
  "updated_by",
  "deleted_by",
  "is_deleted",
]);

const PROTECTED_DOMAINS = new Set([
  "auth",
  "permissions",
  "storage",
  "vault",
  "session",
]);

const camelToSnake = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

async function getAllDomainFolders(baseDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    const folders: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        const fullPath = path.join(baseDir, entry.name);
        folders.push(fullPath);
        const subFolders = await getAllDomainFolders(fullPath);
        folders.push(...subFolders);
      }
    }
    return folders;
  } catch {
    return [];
  }
}

function findBestFolderMatch(
  allFolders: string[],
  tableKey: string,
): string | undefined {
  const snakeTable = camelToSnake(tableKey).replace("_view", "");
  const matches = allFolders.filter(
    (f) => path.basename(f).toLowerCase() === snakeTable,
  );

  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  return matches.find((m) => m.includes("userspermissionsmgt")) || matches[0];
}

function parseInterfaceFields(content: string, interfaceName: string) {
  const regex = new RegExp(
    `export interface ${interfaceName}\\s*{([^}]*)}`,
    "s",
  );
  const match = content.match(regex);
  if (!match) return [];
  const body = match[1];
  const fieldRegex = /(\w+):\s*([^;]+);/g;
  const fields = [];
  let m;
  while ((m = fieldRegex.exec(body)) !== null) {
    fields.push({ name: m[1], type: m[2].trim() });
  }
  return fields;
}

async function run() {
  const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
  const backendBase = path.resolve("backend/src/domains");

  const content = await fs.readFile(kyselyFile, "utf-8");
  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) return;

  const dbMappings = [...dbInterfaceMatch[1].matchAll(/(\w+):\s*(\w+);/g)];
  const allFolders = await getAllDomainFolders(backendBase);

  let generatedCount = 0;

  for (const match of dbMappings) {
    const tableKey = match[1];
    const interfaceName = match[2];

    if (PROTECTED_DOMAINS.has(tableKey.toLowerCase())) continue;
    const targetFolder = findBestFolderMatch(allFolders, tableKey);
    if (!targetFolder) continue;

    const fields = parseInterfaceFields(content, interfaceName);

    const validatorFields = fields
      .map((f) => {
        // Use camelCase directly (Kysely format)
        const fieldName = f.name;
        const tsType = f.type.toLowerCase();
        let zType = "";

        // Use actual TypeScript type from kysely.generated.ts
        if (tsType.includes("boolean")) {
          // 1. Handle Booleans - fuzzy boolean for checkbox compatibility
          const defaultVal = fieldName.includes("active") ? "true" : "false";
          zType = `z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true","1","on"].includes(val.trim().toLowerCase());
            return ${defaultVal};
          }).optional().default(${defaultVal}).nullable()`;
        }
        else if (tsType.includes("timestamp") || tsType.includes("date") || fieldName.endsWith("At")) {
          // 2. Handle Dates (with empty string protection)
          zType = `z.preprocess(val => (val === "" ? undefined : val), z.coerce.date().optional().nullable())`;
        }
        else if (tsType.includes("number") || tsType.includes("int8") || tsType.includes("bigint") || tsType.includes("numeric") || tsType.includes("double") || tsType.includes("real")) {
          // 3. Handle Numbers - numeric coercion
          zType = `z.preprocess(val => {
            const num = Number(val);
            return isNaN(num) ? undefined : num;
          }, z.coerce.number().optional().nullable())`;
        }
        else if (fieldName.endsWith("By") || fieldName.endsWith("Id") || fieldName === "id") {
          // 4. Handle IDs and Foreign Keys (Numeric Coercion)
          zType = `z.preprocess(val => {
            const num = Number(val);
            return isNaN(num) ? undefined : num;
          }, z.coerce.number().optional().nullable())`;
        }
        else {
          // 5. Default String handling
          zType = `z.string().optional().nullable()`;
        }

        return `  ${fieldName}: ${zType},`;
      })
      .join("\n");

    const validatorContent = `import { z } from "zod";

/**
 * ⚠️ Auto-generated Validator for ${interfaceName}
 * Generated for SaaS Multi-tenancy Compliance
 * Uses camelCase to match Kysely types
 * Includes preprocessing to convert snake_case input to camelCase
 */

// Helper to convert snake_case keys to camelCase
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== "object") return obj;
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

export const ${interfaceName}Schema = z.preprocess(
  toCamelCase,
  z.object({
${validatorFields}
  }).passthrough()
);

export type ${interfaceName}Type = z.infer<typeof ${interfaceName}Schema>;
`;

    await fs.writeFile(
      path.join(targetFolder, "validator.ts"),
      validatorContent,
      "utf-8",
    );
    generatedCount++;
    console.log(
      `✅ [${generatedCount}] ${path.relative(backendBase, targetFolder)}/validator.ts`,
    );
  }

  console.log(`\n✨ Success! Generated ${generatedCount} validators.`);
}

run().catch(console.error);
