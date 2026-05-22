// scripts/gen_Perms_Frontend_Barrel.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldBarrel(domain: string, resource: string) {
  const barrelFile = path.join(frontendBase, domain, resource, "index.ts");
  await fs.mkdir(path.dirname(barrelFile), { recursive: true });

  const content = `// Auto-generated frontend barrel for ${capitalize(resource)}
export * from "./types.js";
export * from "./validator.js";
export * from "./errors.js";
export * from "./services.js";
export * from "./controller.js";
export * from "./routes.js";
export * from "./auditLogger.js";
`;

  await fs.writeFile(barrelFile, content, "utf-8");
  console.log(`[Frontend] ✅ Barrel Generated: ${capitalize(resource)}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldBarrel(domain, resource);
    }
  }
}

run().catch(console.error);
