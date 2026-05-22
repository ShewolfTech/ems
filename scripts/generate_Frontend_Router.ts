import { promises as fs } from "fs";
import * as path from "path";

function capitalize(name: string): string {
  return name.split(/[-_]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function getSafeEntityName(name: string): string {
  return name.replace(/[\s\-_]+/g, '');
}

async function getAllFolders(baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  let folders: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      const fullPath = path.join(baseDir, entry.name);
      folders.push(fullPath);
      const subFolders = await getAllFolders(fullPath);
      folders.push(...subFolders);
    }
  }
  return folders;
}

async function run() {
  const componentsBase = path.resolve("frontend/src/components/domains");
  const registryPath = path.resolve("frontend/src/app/routes/RouteRegistry.ts");
  
  console.log("📡 Scanning for generated Pages...");
  const allFolders = await getAllFolders(componentsBase);
  const validEntries: any[] = [];

  for (const folder of allFolders) {
    const folderName = path.basename(folder);
    const entityName = capitalize(folderName);
    const safeName = getSafeEntityName(entityName);
    const relativePath = path.relative(componentsBase, folder).replace(/\\/g, "/");

    const pageFileName = `${safeName}Page.tsx`;
    const pagePath = path.join(folder, pageFileName);
    const exists = await fs.stat(pagePath).catch(() => null);

    if (exists) {
      // --- THE FIX: FLATTEN THE ROUTE PATH ---
      // This removes "views" or "reports" from the URL path, but NOT from the import path
      const flattenedPath = relativePath
        .split('/')
        .filter(part => part !== "views" && part !== "reports")
        .join('/')
        .toLowerCase();

      validEntries.push({
        componentName: `${safeName}Page`,
        importPath: `@/components/domains/${relativePath}/index.js`,
        routeKey: relativePath.replace(/\//g, "."),
        path: flattenedPath,
        label: entityName,
        resource: folderName // The actual database resource name
      });
    }
  }

  const imports = validEntries
    .map(e => `import { ${e.componentName} } from "${e.importPath}";`)
    .join("\n");

  const mapping = validEntries
    .map(e => `  "${e.routeKey}": {
    component: ${e.componentName},
    path: "/${e.path}",
    label: "${e.label}",
    resource: "${e.resource}"
  }`)
    .join(",\n");

  const registryContent = `// Auto-generated Route Registry
import React from "react";
${imports}

export interface RegistryEntry {
  component: React.ComponentType<any>;
  path: string;
  label: string;
  resource: string;
}

export const ComponentRegistry: Record<string, RegistryEntry> = {
${mapping}
};
`;

  await fs.writeFile(registryPath, registryContent, "utf-8");
  console.log(`✨ Success! Registered ${validEntries.length} pages in RouteRegistry.ts`);
}

run().catch(console.error);