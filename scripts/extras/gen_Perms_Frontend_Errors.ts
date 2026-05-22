// scripts/gen_Perms_Frontend_Errors.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldErrors(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const errorsFile = path.join(frontendBase, domain, resource, "errors.ts");
  await fs.mkdir(path.dirname(errorsFile), { recursive: true });

  const content = `// Auto-generated frontend errors for ${pascalName}

export class ${pascalName}ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "${pascalName}ValidationError";
  }
}

export class ${pascalName}ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "${pascalName}ServiceError";
  }
}
`;

  await fs.writeFile(errorsFile, content, "utf-8");
  console.log(`[Frontend] ✅ Errors Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldErrors(domain, resource);
    }
  }
}

run().catch(console.error);
