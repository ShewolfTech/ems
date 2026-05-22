// scripts/gen_Backend_Domains_Registry.ts
import { promises as fs } from "fs";
import path from "path";

async function fileExists(p: string) {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

function normalizeName(name: string): string {
  return name.replace(/_/g, "").toLowerCase();
}

async function findDomainFolder(baseDir: string, interfaceName: string): Promise<string | null> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const normalizedInterface = normalizeName(interfaceName);

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(baseDir, entry.name);
      const normalizedFolder = normalizeName(entry.name);

      if (normalizedFolder.includes(normalizedInterface)) {
        return fullPath;
      }

      const found = await findDomainFolder(fullPath, interfaceName);
      if (found) return found;
    }
  }
  return null;
}

async function extractValidatorExports(validatorPath: string): Promise<string[]> {
  const content = await fs.readFile(validatorPath, "utf-8");
  const matches = [...content.matchAll(/export const (\w+)/g)];
  return matches.map(m => m[1]);
}

async function run() {
  const kyselyFile = path.resolve("shared/src/db/kysely.generated.ts");
  const domainsBase = path.resolve("backend/src/domains");
  const registryPath = path.resolve("backend/src/registry/index.ts");
  const content = await fs.readFile(kyselyFile, "utf-8");

  const dbInterfaceMatch = content.match(/export interface DB\s*{([^}]+)}/s);
  if (!dbInterfaceMatch) return;

  const dbMappings = [...dbInterfaceMatch[1].matchAll(/("?[\w\.]+"?):\s*(\w+);/g)];

  let imports = "";
  let registryEntries = "";
  const dropped: string[] = [];
  let includedCount = 0;

  const seenImports = new Set<string>();
  const seenAliases = new Set<string>();

  for (const match of dbMappings) {
    const tableKey = match[1].replace(/"/g, "");
    const interfaceName = match[2];
    const targetDir = await findDomainFolder(domainsBase, interfaceName);

    if (!targetDir) {
      dropped.push(`${interfaceName} (${tableKey}) — no folder found`);
      continue;
    }

    const validatorPath = path.join(targetDir, "validator.ts");
    const typesPath = path.join(targetDir, "types.ts");

    if (!(await fileExists(validatorPath)) || !(await fileExists(typesPath))) {
      dropped.push(`${interfaceName} (${tableKey}) — missing validator.ts or types.ts`);
      continue;
    }

    const exports = await extractValidatorExports(validatorPath);
    if (exports.length === 0) {
      dropped.push(`${interfaceName} (${tableKey}) — no exports found in validator.ts`);
      continue;
    }

    // Pick the most relevant export (prefer Schema/Query)
    const importName =
      exports.find(e => /Schema$/.test(e)) ||
      exports.find(e => /Query$/.test(e)) ||
      exports[0];

    const relativePath = path.relative(path.dirname(registryPath), targetDir).replace(/\\/g, "/");
    const domainAlias = tableKey.replace(/[^a-zA-Z0-9]/g, "");

    const importKey = `${importName}@${relativePath}`;
    if (seenImports.has(importKey)) {
      console.warn(`⚠️ Skipping duplicate import: ${importName} from ${relativePath}`);
      continue;
    }
    seenImports.add(importKey);

    if (seenAliases.has(domainAlias)) {
      console.warn(`⚠️ Skipping duplicate registry alias: ${domainAlias}`);
      continue;
    }
    seenAliases.add(domainAlias);

    imports += `import { ${importName} } from "${relativePath}/validator.js";\n`;

    registryEntries += `  ${domainAlias}: {
    resource: "${tableKey}",
    interface: "${interfaceName}",
    schema: ${importName},
    path: "${relativePath}",
    isMenuAvailable: ${/permission|route/i.test(tableKey)},
  },\n`;

    includedCount++;
  }

  const registryContent = `// ⚠️ Auto-generated Registry. Do not edit manually.
import { z } from "zod";
${imports}

export const DomainRegistry = {
${registryEntries}} as const;

export type DomainName = keyof typeof DomainRegistry;
`;

  await fs.mkdir(path.dirname(registryPath), { recursive: true });
  await fs.writeFile(registryPath, registryContent, "utf-8");

  console.log(`✅ Registry synchronized. Included ${includedCount} domains.`);
  if (dropped.length > 0) {
    console.log("\n⚠️ Dropped resources:");
    dropped.forEach(s => console.log(" - " + s));
  }
}

run().catch(console.error);
