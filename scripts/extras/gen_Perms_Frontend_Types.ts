// scripts/gen_Perms_Frontend_Types.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldTypes(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const typesFile = path.join(frontendBase, domain, resource, "types.ts");
  await fs.mkdir(path.dirname(typesFile), { recursive: true });

  const content = `// Auto-generated frontend types for ${pascalName}

export type ${pascalName} = {
  id: number;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
};

export type Create${pascalName} = Omit<${pascalName}, "id" | "createdAt" | "updatedAt">;
export type Update${pascalName} = Partial<Create${pascalName}>;
`;

  await fs.writeFile(typesFile, content, "utf-8");
  console.log(`[Frontend] ✅ Types Generated: ${pascalName}`);
}

async function run() {
  // Cast registry to avoid TS7053 error
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldTypes(domain, resource);
    }
  }
}

run().catch(console.error);
