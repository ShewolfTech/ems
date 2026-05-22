// scripts/gen_Frontend_Validators.ts
import { promises as fs } from "fs";
import path from "path";

const SYSTEM_FIELDS = new Set([
  "id", "school_id", "user_id",
  "created_at", "updated_at", "deleted_at",
  "created_by", "updated_by", "deleted_by",
  "is_deleted"
]);

const PROTECTED_DOMAINS = new Set(["auth", "permissions", "storage", "vault", "session"]);

const toSnakeCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

const typeMap: Record<string, string> = {
  string: "z.string()",
  number: "z.coerce.number()",
  boolean: "z.boolean()",
  Date: "z.coerce.date()",
  Int8: "z.coerce.number()",
  Timestamp: "z.coerce.date()",
  Numeric: "z.coerce.number()",
};

async function getAllDomainFolders(baseDir: string): Promise<string[]> {
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
}

function normalizeName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase().replace(/_view$/, "").replace(/s$/, "");
}

function parseInterfaceFields(content: string, interfaceName: string) {
  const regex = new RegExp(`export interface ${interfaceName}\\s*{([^}]*)}`, "s");
  const match = content.match(regex);
  if (!match) return [];
  const body = match[1];
  const fieldRegex = /(\w+):\s*([^;]+);/g;
  const fields = [];
  let m;
  while ((m = fieldRegex.exec(body)) !== null) {
    fields.push({ name: m[1], type: m[2].trim(), nullable: m[2].includes("| null") });
  }
  return fields;
}

async function run() {
  const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
  const frontendBase = path.resolve("frontend/src/domains");
  const content = await fs.readFile(kyselyFile, "utf-8");

  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) return;

  const dbMappings = [...dbInterfaceMatch[1].matchAll(/(\w+):\s*(\w+);/g)];
  const allFolders = await getAllDomainFolders(frontendBase);

  console.log(`📡 Regenerating resilient frontend validators...`);

  for (const match of dbMappings) {
    const tableKey = match[1];
    const interfaceName = match[2];
    const normalizedTable = normalizeName(tableKey);
    const targetFolder = allFolders.find(f => normalizeName(path.basename(f)) === normalizedTable);

    if (!targetFolder) continue;

    const fields = parseInterfaceFields(content, interfaceName);

    const validatorFields = fields.map(f => {
      const snakeName = toSnakeCase(f.name);
      const baseType = f.type.replace(/Generated<|>/g, "").split("|")[0].trim();
      let zType = typeMap[baseType] || "z.any()";

      // 🚀 FIX: Priority Logic for IDs (Covers updated_by and created_by equally)
      if (snakeName.endsWith("_by") || snakeName.endsWith("_id") || snakeName === "id") {
        zType = `z.preprocess((val) => {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.coerce.number().optional().nullable())`;
      } 
      // 2. Boolean Logic
      else if (snakeName.startsWith("is_") || snakeName.startsWith("is")) {
        const defaultVal = snakeName.includes("active") ? "true" : "false";
        zType = `z.union([z.boolean(), z.string(), z.number()])
          .transform(val => {
            if (typeof val === "boolean") return val;
            if (typeof val === "number") return val === 1;
            if (typeof val === "string") return ["true", "1", "yes", "on"].includes(val.trim().toLowerCase());
            return ${defaultVal};
          }).optional().default(${defaultVal}).nullable()`;
      } 
      // 3. Date Logic (Now only triggers if it didn't match an ID field first)
      else if (snakeName.endsWith("_at") || snakeName.includes("date")) {
        zType = "z.coerce.date().optional().nullable()";
      }

      if (f.nullable && !zType.includes(".nullable()")) zType += ".nullable()";

      return `  ${snakeName}: ${zType},`;
    }).join("\n");

    const validatorContent = `import { z } from "zod";

/**
 * Resilient Snake_Case Validator
 * Generated for ${interfaceName}
 */
export const ${interfaceName}Schema = z.object({
${validatorFields}
}).passthrough();

export type ${interfaceName}Type = z.infer<typeof ${interfaceName}Schema>;
`;
    await fs.writeFile(path.join(targetFolder, "validator.ts"), validatorContent, "utf-8");
  }
  console.log(`✅ Success! Frontend validators are now consistent.`);
}

run().catch(console.error);