// scripts/generateDomainFiles.ts
import { promises as fs } from "fs";
import path from "path";

const SYSTEM_FIELDS = new Set([
  "id","created_at","updated_at","deleted_at","deleted_by",
  "created_by","updated_by","is_deleted","is_active",
  "isActive","createdAt","updatedAt",
]);

const typeMap: Record<string, string> = {
  string: "z.string()",
  number: "z.number()",
  boolean: "z.boolean()",
  Date: "z.date()",
  Int8: "z.number()",
  Timestamp: "z.date()",
  Numeric: "z.number()",
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

// Normalize camelCase → snake_case, strip "View", strip trailing "s"
function normalizeName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/_view$/, "")
    .replace(/s$/, "");
}

function parseInterfaceFields(content: string, interfaceName: string) {
  const regex = new RegExp(`export interface ${interfaceName}\\s*{([^}]*)}`, "s");
  const match = content.match(regex);
  if (!match) return [];
  const body = match[1];
  const fieldRegex = /(\w+):\s*([^;]+);/g;
  const fields: { name: string; type: string; required: boolean; nullable: boolean }[] = [];
  let fieldMatch;
  while ((fieldMatch = fieldRegex.exec(body)) !== null) {
    const name = fieldMatch[1];
    const type = fieldMatch[2].trim();
    const isSystem = SYSTEM_FIELDS.has(name);
    const isGenerated = type.includes("Generated<");
    const isNullable = type.includes("| null");
    const required = !isSystem && !isGenerated && !isNullable;
    fields.push({ name, type, required, nullable: isNullable });
  }
  return fields;
}

async function run() {
  const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
  const frontendBase = path.resolve("frontend/src/domains");
  const content = await fs.readFile(kyselyFile, "utf-8");

  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) {
    console.error("❌ Could not find DB interface in kysely.generated.ts");
    return;
  }

  const dbMappings = [...dbInterfaceMatch[1].matchAll(/(\w+):\s*(\w+);/g)];
  const skipDomains = new Set(["auth","permissions","storage","vault"]);

  const allFolders = await getAllDomainFolders(frontendBase);
  console.log(`📡 Regenerating types + validators...`);

  let generatedCount = 0;

  for (const match of dbMappings) {
    const tableKey = match[1];       // e.g. academicYears, assignmentSubmissionsView
    const interfaceName = match[2];  // e.g. AcademicYears, AssignmentSubmissionsView

    if (skipDomains.has(tableKey.split('.')[0].toLowerCase())) continue;

    const normalizedTable = normalizeName(tableKey);
    const targetFolder = allFolders.find(
      f => normalizeName(path.basename(f)) === normalizedTable
    );

    if (!targetFolder) {
      console.warn(`⚠️ No folder found for ${tableKey} (${interfaceName})`);
      continue;
    }

    const isView = tableKey.endsWith("View");
    const fields = parseInterfaceFields(content, interfaceName);

    // --- Types ---
    if (isView) {
      const typeContent = `// Auto-generated read-only type for ${interfaceName}
import type { DB } from "@shared/db/kysely.generated.js";

export type ${interfaceName} = DB["${tableKey}"];
`;
      await fs.writeFile(path.join(targetFolder, "types.ts"), typeContent, "utf-8");
      console.log(`📖 Read-only view type generated: ${interfaceName}`);
    } else {
      const requiredFields = fields.filter(f => f.required);
      const typeContent = `// Auto-generated types for ${interfaceName} domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S }
  ? S
  : T extends { readonly __brand__: any }
  ? T
  : T;

export type ${interfaceName} = {
  [K in keyof DB["${tableKey}"]]: Unwrap<DB["${tableKey}"][K]>;
};

export type Create${interfaceName} = Omit<${interfaceName}, ${Array.from(SYSTEM_FIELDS).map(f => `"${f}"`).join(" | ")}>;
export type Update${interfaceName} = Partial<Create${interfaceName}>;

export type ${interfaceName}Payload = {
  ${requiredFields.map(f => `${f.name}: ${interfaceName}["${f.name}"];`).join("\n  ")}
} & Partial<Create${interfaceName}>;

export type ${interfaceName}InitialValues = {
  ${requiredFields.map(f => `${f.name}: ${interfaceName}["${f.name}"];`).join("\n  ")}
} & Partial<${interfaceName}>;
`;
      await fs.writeFile(path.join(targetFolder, "types.ts"), typeContent, "utf-8");
      console.log(`✅ Full CRUD types generated: ${interfaceName}`);
    }

    // --- Validators ---
    const validatorFields = fields.map(f => {
      const baseType = f.type.replace(/Generated<|>/g, "").split("|")[0].trim();
      let zType = typeMap[baseType] || "z.any()";
      if (f.nullable) zType += ".nullable()";
      return `  ${f.name}: ${zType},`;
    }).join("\n");

    const validatorContent = `import { z } from "zod";

export const ${interfaceName}Schema = z.object({
${validatorFields}
});
`;
    await fs.writeFile(path.join(targetFolder, "validator.ts"), validatorContent, "utf-8");
    console.log(`🛡️ Validator generated: ${interfaceName}`);

    generatedCount++;
  }

  console.log(`\n✨ Summary: Generated ${generatedCount} domain types + validators.`);
}

run().catch(console.error);
