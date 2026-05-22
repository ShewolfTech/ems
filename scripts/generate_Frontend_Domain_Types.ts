// scripts/generate_Frontend_Domain_Types.ts
import { promises as fs } from "fs";
import path from "path";

const SYSTEM_FIELDS = new Set([
  "id", "schoolId", "school_id", "userId", "user_id",
  "created_at", "updated_at", "deleted_at", "createdAt", "updatedAt", "deletedAt",
  "created_by", "updated_by", "deleted_by", "createdBy", "updatedBy", "deletedBy",
  "is_deleted", "isDeleted",
]);

const EXCLUDED_FIELDS = new Set([
  ...SYSTEM_FIELDS,
]);

const PROTECTED_DOMAINS = new Set(["auth", "permissions", "storage", "vault", "session"]);

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

/** * 🔥 CRITICAL FIX: Ensure keys match the Snake Case Backend 
 */
function camelToSnake(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

function normalizeName(name: string): string {
  return camelToSnake(name)
    .replace(/_view$/, "")
    .replace(/s$/, "");
}

function toLabel(name: string): string {
  return name
    .replace(/_id$/g, "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

interface ParsedField {
  name: string;
  type: string;
}

function parseInterfaceFields(content: string, interfaceName: string): ParsedField[] {
  const regex = new RegExp(`export interface ${interfaceName}\\s*{([^}]*)}`, "s");
  const match = content.match(regex);
  if (!match) return [];
  const body = match[1];
  // Match field name and its type (e.g., "category: string" or "isActive: Generated<boolean | null>")
  const fieldRegex = /(\w+):\s*([^;]+);/g;
  const fields: ParsedField[] = [];
  let fieldMatch;
  while ((fieldMatch = fieldRegex.exec(body)) !== null) {
    fields.push({ name: fieldMatch[1], type: fieldMatch[2].trim() });
  }
  return fields;
}

/** Extract all table names from DB interface for relation detection */
function getAllTableNames(content: string): Set<string> {
  const tableNames = new Set<string>();
  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) return tableNames;
  
  const mappings = [...dbInterfaceMatch[1].matchAll(/(\w+):\s*(\w+);/g)];
  for (const match of mappings) {
    const tableKey = match[1];
    const interfaceName = match[2];
    // Add both the key (e.g., attendances.leaves) and interface name (e.g., Leaves)
    tableNames.add(tableKey.split(".")[1] || tableKey);
    tableNames.add(interfaceName);
    // Also add singular versions
    tableNames.add(interfaceName.replace(/s$/, ""));
    tableNames.add(interfaceName.replace(/ies$/, "y"));
  }
  return tableNames;
}

/** Map TypeScript types to UI input types */
function getUiTypeFromTsType(tsType: string, fieldName: string, allTableNames: Set<string>): string {
  const lower = tsType.toLowerCase();
  const upperCamel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  const lowerCamel = fieldName.toLowerCase();
  
  // Check for foreign key / relation fields (fields ending with Id that match a table name)
  // e.g., leaveTypeId -> leaveTypes table, userId -> users table
  if (fieldName.endsWith('Id') || fieldName.endsWith('ID')) {
    // Try to find matching table
    const possibleTableNames = [
      upperCamel + 's',      // leaveTypeId -> leaveTypes
      upperCamel,             // leaveTypeId -> leaveType
      lowerCamel.replace(/id$/, '') + '_types', // leaveTypeId -> leave_types
      lowerCamel.replace(/id$/, 's'),   // leaveTypeId -> leaveTypes
    ];
    
    for (const tableName of possibleTableNames) {
      if (allTableNames.has(tableName)) {
        return 'relation';
      }
    }
  }
  
  // Check for boolean types (including fields like is_active, requires_calibration)
  if (lower.includes('boolean')) {
    return 'boolean';
  }
  
  // Check for timestamp/date types
  if (lower.includes('timestamp') || lower.includes('datetime') || lower.includes('date>')) {
    return 'date';
  }
  
  // Check for number types
  if (lower.includes('number') || lower.includes('int8') || lower.includes('bigint') || lower.includes('numeric') || lower.includes('double') || lower.includes('real')) {
    return 'number';
  }
  
  // Check for JSON types
  if (lower.includes('json')) {
    return 'json';
  }
  
  // Check for array types (e.g., string[], number[])
  if (lower.includes('[]')) {
    return 'multiselect';
  }
  
  // Default to text
  return 'text';
}

/** Get relation info for foreign key fields */
function getRelationInfo(fieldName: string, allTableNames: Set<string>): string | null {
  if (!fieldName.endsWith('Id') && !fieldName.endsWith('ID')) {
    return null;
  }
  
  const upperCamel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  const lowerCamel = fieldName.toLowerCase();
  
  // Try to find matching table
  const possibleTableNames = [
    upperCamel + 's',
    upperCamel,
    lowerCamel.replace(/id$/, '') + '_types',
    lowerCamel.replace(/id$/, 's'),
    lowerCamel.replace(/_id$/, ''),
    lowerCamel.replace(/_id$/, 's'),
  ];
  
  for (const tableName of possibleTableNames) {
    if (allTableNames.has(tableName)) {
      // Convert tableName to snake_case for resource
      const snakeTable = tableName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      return `, relation: "${snakeTable}"`;
    }
  }
  
  return null;
}

async function run() {
  const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
  const frontendBase = path.resolve("frontend/src/domains");
  const content = await fs.readFile(kyselyFile, "utf-8");

  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) return;

  // Extract all table names for relation detection
  const allTableNames = getAllTableNames(content);
  
  const dbMappings = [...dbInterfaceMatch[1].matchAll(/(\w+):\s*(\w+);/g)];
  const allFolders = await getAllDomainFolders(frontendBase);
  
  console.log(`📡 Regenerating types + metadata (SNAKE_CASE FORCED)...`);

  let generatedCount = 0;
  const metadataExports: { name: string; folder: string }[] = [];

  for (const match of dbMappings) {
    const tableKey = match[1];
    const interfaceName = match[2];

    const domainPrefix = tableKey.split(".")[0].toLowerCase();
    if (PROTECTED_DOMAINS.has(domainPrefix)) continue;

    const normalizedTable = normalizeName(tableKey);
    const targetFolder = allFolders.find(
      (f) => normalizeName(path.basename(f)) === normalizedTable,
    );

    if (!targetFolder) continue;

    const folderName = path.basename(targetFolder).toLowerCase();
    if (PROTECTED_DOMAINS.has(folderName)) continue;

    const isView = tableKey.endsWith("view");

    if (isView) {
      const typeContent = `// Auto-generated read-only type for ${interfaceName}
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type ${interfaceName} = {
  [K in keyof DB["${tableKey}"]]: Unwrap<DB["${tableKey}"][K]>;
};
`;
      await fs.writeFile(path.join(targetFolder, "types.ts"), typeContent, "utf-8");
    } else {
      const fields = parseInterfaceFields(content, interfaceName);
      // Ensure we exclude both versions of system fields
      const requiredFields = fields.filter((f) => !EXCLUDED_FIELDS.has(f.name) && !EXCLUDED_FIELDS.has(camelToSnake(f.name)));

      const metadataFields = requiredFields
        .map((f) => {
          const snake = camelToSnake(f.name);
          // Use actual TypeScript type for uiType determination
          const uiType = getUiTypeFromTsType(f.type, f.name, allTableNames);
          // Check for relation info
          const relationInfo = getRelationInfo(f.name, allTableNames);
          return `    { name: "${snake}", label: "${toLabel(f.name)}", uiType: "${uiType}"${relationInfo || ''}, required: true }`;
        })
        .join(",\n");

      const typeContent = `// Auto-generated types for ${interfaceName} domain
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

export type ${interfaceName} = {
  [K in keyof DB["${tableKey}"]]: Unwrap<DB["${tableKey}"][K]>;
};

export type Create${interfaceName} = Omit<${interfaceName}, ${Array.from(SYSTEM_FIELDS).map((f) => `"${f}"`).join(" | ")}>;
export type Update${interfaceName} = Partial<Create${interfaceName}>;

export type ${interfaceName}Payload = {
  ${requiredFields.map((f) => `"${camelToSnake(f.name)}": ${interfaceName}["${f.name}"];`).join("\n  ")}
};

export type ${interfaceName}InitialValues = ${interfaceName}Payload;
export type ${interfaceName}DefaultValues = Partial<${interfaceName}Payload>;
export type ${interfaceName}FormValues = ${interfaceName}Payload;

export const ${interfaceName}Metadata = {
  resource: "${tableKey}",
  label: "${toLabel(tableKey)}",
  fields: [
${metadataFields}
  ]
};
`;
      await fs.writeFile(path.join(targetFolder, "types.ts"), typeContent, "utf-8");
      metadataExports.push({ name: `${interfaceName}Metadata`, folder: path.relative(frontendBase, targetFolder) });
    }
    generatedCount++;
  }

  // Generate central index (using your original logic)
  const indexContent = metadataExports
    .map((m) => `export { ${m.name} } from "./${m.folder.replace(/\\/g, "/")}/types.js";`)
    .join("\n");

  await fs.writeFile(path.join(frontendBase, "metadata.types.index.ts"), indexContent, "utf-8");

  console.log(`\n✨ Done! Generated ${generatedCount} domain types. All keys forced to snake_case.`);
}

run().catch(console.error);
