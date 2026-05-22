// scripts/generate_Frontend_Domain_Errors.ts
import { promises as fs } from "node:fs";
import path from "node:path";

const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
const frontendBase = path.resolve("frontend/src/domains");

/**
 * Normalizes Interface names to find the domain folder
 */
async function findDomainFolder(baseDir: string, targetName: string): Promise<string | null> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const normalizedTarget = targetName.toLowerCase().replace(/s$/, "");

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderName = entry.name.toLowerCase().replace(/[-_]/g, "").replace(/s$/, "");
      if (folderName === normalizedTarget) return path.join(baseDir, entry.name);

      const sub = await findDomainFolder(path.join(baseDir, entry.name), targetName);
      if (sub) return sub;
    }
  }
  return null;
}

async function run() {
  const content = await fs.readFile(kyselyFile, "utf-8");
  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) return;

  const dbMappings = [...dbInterfaceMatch[1].matchAll(/("?[\w\.]+"?):\s*(\w+);/g)];

  for (const match of dbMappings) {
    const tableKey = match[1].replace(/"/g, "");
    const interfaceName = match[2];

    if (tableKey.includes(".")) continue; // skip internal schemas

    const targetDir = await findDomainFolder(frontendBase, interfaceName);
    if (!targetDir) continue;

    const errorFile = path.join(targetDir, "errors.ts");
    const pascalName = interfaceName;
    const isView = tableKey.endsWith("_view");

    let errorContent = `/**
 * Auto-generated error classes for ${pascalName}
 */
`;

    if (!isView) {
      // Tables: ValidationError + ServiceError
      errorContent += `
export class ${pascalName}ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "${pascalName}ValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ${pascalName}ValidationError);
    }
  }
}

export class ${pascalName}ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "${pascalName}ServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ${pascalName}ServiceError);
    }
  }
}
`;
    } else {
      // Views: only ServiceError
      errorContent += `
export class ${pascalName}ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "${pascalName}ServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ${pascalName}ServiceError);
    }
  }
}
`;
    }

    await fs.writeFile(errorFile, errorContent, "utf-8");
    console.log(`✅ Error Classes Generated: ${pascalName}`);
  }
}

run().catch(console.error);
