import { promises as fs } from "fs";
import path from "path";

const domainsBase = path.resolve("backend/src/domains");

function toPascalCase(name: string) {
  return name
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

async function generateResourceIndex(resourcePath: string) {
  const entries = await fs.readdir(resourcePath, { withFileTypes: true });
  const hasRoutes = entries.some((e) => e.isFile() && e.name === "routes.ts");

  let content = "";

  if (hasRoutes) {
    // Export router by default if routes.ts exists
    content = `import router from "./routes.js";\nexport default router;\n`;
  } else {
    // Fallback: re-export files
    const exports: string[] = [];
    for (const entry of entries) {
      if (
        entry.isFile() &&
        entry.name.endsWith(".ts") &&
        entry.name !== "index.ts"
      ) {
        const base = entry.name.replace(/\.ts$/, "");
        const nsName = base.charAt(0).toUpperCase() + base.slice(1);
        exports.push(`export * as ${nsName} from "./${base}.js";`);
      }
    }
    content = exports.join("\n") + "\n";
  }

  const indexPath = path.join(resourcePath, "index.ts");
  await fs.writeFile(indexPath, content, "utf-8");
  console.log(
    `✅ Resource Index Generated: ${path.relative(domainsBase, indexPath)}`,
  );
}

async function generateDomainIndex(domainPath: string) {
  const entries = await fs.readdir(domainPath, { withFileTypes: true });
  const imports: string[] = [];
  const mounts: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nsName = toPascalCase(entry.name);
      imports.push(`import ${nsName} from "./${entry.name}/index.js";`);
      mounts.push(
        `router.use("/${entry.name.replace(/_/g, "-")}", ${nsName});`,
      );
    }
  }

  if (imports.length > 0) {
    const content = `import { Router } from "express";\n${imports.join("\n")}\n\nconst router = Router();\n\n${mounts.join("\n")}\n\nexport default router;\n`;
    const indexPath = path.join(domainPath, "index.ts");
    await fs.writeFile(indexPath, content, "utf-8");
    console.log(
      `✅ Domain Router Index Generated: ${path.relative(domainsBase, indexPath)}`,
    );
  }
}

async function generateTopLevelIndex() {
  const entries = await fs.readdir(domainsBase, { withFileTypes: true });
  const imports: string[] = [];
  const mounts: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nsName = toPascalCase(entry.name);
      imports.push(`import ${nsName} from "./${entry.name}/index.js";`);
      mounts.push(
        `router.use("/${entry.name.replace(/_/g, "-")}", ${nsName});`,
      );
    }
  }

  if (imports.length > 0) {
    const content = `import { Router } from "express";\n${imports.join("\n")}\n\nconst router = Router();\n\n${mounts.join("\n")}\n\nexport default router;\n`;
    const indexPath = path.join(domainsBase, "index.ts");
    await fs.writeFile(indexPath, content, "utf-8");
    console.log(`✅ Top-Level Router Index Generated: domains/index.ts`);
  }
}

async function run() {
  const domainFolders = await fs.readdir(domainsBase, { withFileTypes: true });

  for (const domain of domainFolders) {
    if (!domain.isDirectory()) continue;

    const domainPath = path.join(domainsBase, domain.name);

    // Generate resource indexes inside domain
    const resources = await fs.readdir(domainPath, { withFileTypes: true });
    for (const res of resources) {
      if (res.isDirectory()) {
        const resPath = path.join(domainPath, res.name);

        if (res.name === "views") {
          const viewResources = await fs.readdir(resPath, {
            withFileTypes: true,
          });
          for (const viewRes of viewResources) {
            if (viewRes.isDirectory()) {
              await generateResourceIndex(path.join(resPath, viewRes.name));
            }
          }
          await generateDomainIndex(resPath);
        } else {
          await generateResourceIndex(resPath);
        }
      }
    }

    // Generate domain-level index.ts with router mounting
    await generateDomainIndex(domainPath);
  }

  // Generate top-level index.ts with router mounting
  await generateTopLevelIndex();

  console.log("\n🎉 All index generation complete.");
}

run().catch(console.error);
