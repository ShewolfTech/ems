import { promises as fs } from "fs";
import path from "path";

const frontendBase = path.resolve("frontend/src/domains");
const skipDomains = new Set(["auth", "permissions"]);

async function cleanAndScaffold(folder: string, domainName: string) {
  const entries = await fs.readdir(folder, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);

    if (entry.isDirectory()) {
      if (skipDomains.has(entry.name)) continue;
      await cleanAndScaffold(fullPath, entry.name);
    } else {
      // remove placeholder index.ts
      if (entry.name === "index.ts") {
        await fs.unlink(fullPath);
        console.log(`🗑️ Removed: ${fullPath}`);
      }
      // remove empty barrel.ts
      if (entry.name === "barrel.ts") {
        const content = await fs.readFile(fullPath, "utf-8");
        if (!content.trim()) {
          await fs.unlink(fullPath);
          console.log(`🗑️ Removed empty barrel: ${fullPath}`);
        }
      }
    }
  }

  // scaffold real files
  const componentFile = path.join(folder, `${capitalize(domainName)}List.tsx`);
  const hookFile = path.join(folder, `use${capitalize(domainName)}s.ts`);
  const pageFile = path.join(folder, `${capitalize(domainName)}Page.tsx`);
  const configFile = path.join(folder, `${domainName}Config.ts`);
  const registryFile = path.join(folder, `${domainName}Registry.ts`);
  const barrelFile = path.join(folder, "barrel.ts");

  await fs.writeFile(componentFile, `export function ${capitalize(domainName)}List() { return <div>${capitalize(domainName)} list</div>; }`);
  await fs.writeFile(hookFile, `import { useEffect, useState } from "react";\nimport { load${capitalize(domainName)}s } from "./controller.js";\n\nexport function use${capitalize(domainName)}s() {\n  const [data, setData] = useState([]);\n  useEffect(() => { load${capitalize(domainName)}s().then(setData); }, []);\n  return data;\n}`);
  await fs.writeFile(pageFile, `import { ${capitalize(domainName)}List } from "./${capitalize(domainName)}List.js";\n\nexport default function ${capitalize(domainName)}Page() { return <${capitalize(domainName)}List />; }`);
  await fs.writeFile(configFile, `export const ${domainName}Config = { route: "/${domainName}", title: "${capitalize(domainName)}" };`);
  await fs.writeFile(registryFile, `import { ${domainName}Config } from "./${domainName}Config.js";\nexport const ${domainName}Registry = { ...${domainName}Config, enabled: true };`);
  await fs.writeFile(barrelFile, `export * from "./types.js";\nexport * from "./services.js";\nexport * from "./validator.js";\nexport * from "./controller.js";\nexport * from "./${capitalize(domainName)}List.js";\nexport * from "./use${capitalize(domainName)}s.js";\nexport * from "./${capitalize(domainName)}Page.js";\nexport * from "./${domainName}Config.js";\nexport * from "./${domainName}Registry.js";`);
}

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function run() {
  const domains = await fs.readdir(frontendBase, { withFileTypes: true });
  for (const domain of domains) {
    if (domain.isDirectory() && !skipDomains.has(domain.name)) {
      await cleanAndScaffold(path.join(frontendBase, domain.name), domain.name);
    }
  }
  console.log("\n✨ Cleanup + scaffolding complete. Domains wired straight away.");
}

run().catch(console.error);
