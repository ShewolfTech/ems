// scripts/gen_Perms_Backend_Services.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const backendBase = path.resolve("backend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldService(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const serviceFile = path.join(backendBase, domain, resource, "service.ts");
  await fs.mkdir(path.dirname(serviceFile), { recursive: true });

  const content = `// Auto-generated backend service for ${pascalName}
import type { ${pascalName}, Create${pascalName}, Update${pascalName} } from "./types.js";

export async function get${pascalName}List(params?: any): Promise<{ data: ${pascalName}[] }> {
  // TODO: implement DB query
  return { data: [] };
}

export async function get${pascalName}ById(id: number): Promise<{ data: ${pascalName} }> {
  // TODO: implement DB query
  return { data: { id, name: "", createdAt: new Date(), updatedAt: new Date() } as ${pascalName} };
}

export async function create${pascalName}(data: Create${pascalName}): Promise<{ data: ${pascalName} }> {
  // TODO: implement DB insert
  return { data: { id: 1, ...data, createdAt: new Date(), updatedAt: new Date() } as ${pascalName} };
}

export async function update${pascalName}(id: number, data: Update${pascalName}): Promise<{ data: ${pascalName} }> {
  // TODO: implement DB update
  return { data: { id, ...data, updatedAt: new Date(), createdAt: new Date() } as ${pascalName} };
}

export async function delete${pascalName}(id: number): Promise<{ data: void }> {
  // TODO: implement DB delete
  return { data: undefined };
}

export async function get${pascalName}Report(params?: any): Promise<{ data: any }> {
  // TODO: implement report generation
  return { data: {} };
}
`;

  await fs.writeFile(serviceFile, content, "utf-8");
  console.log(`[Backend] ✅ Service Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldService(domain, resource);
    }
  }
}

run().catch(console.error);
