// scripts/gen_Perms_Frontend_Services.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldService(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const serviceFile = path.join(frontendBase, domain, resource, "services.ts");
  await fs.mkdir(path.dirname(serviceFile), { recursive: true });

  const content = `// Auto-generated frontend service for ${pascalName}
import type { ${pascalName}, Create${pascalName}, Update${pascalName} } from "./types.js";

const API_BASE = "/api/${domain}/${resource}";

export async function get${pascalName}List(params?: any): Promise<{ data: ${pascalName}[] }> {
  const res = await fetch(\`\${API_BASE}\`, { method: "GET" });
  return { data: await res.json() };
}

export async function get${pascalName}ById(id: number): Promise<{ data: ${pascalName} }> {
  const res = await fetch(\`\${API_BASE}/\${id}\`, { method: "GET" });
  return { data: await res.json() };
}

export async function create${pascalName}(data: Create${pascalName}): Promise<{ data: ${pascalName} }> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { data: await res.json() };
}

export async function update${pascalName}(id: number, data: Update${pascalName}): Promise<{ data: ${pascalName} }> {
  const res = await fetch(\`\${API_BASE}/\${id}\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { data: await res.json() };
}

export async function delete${pascalName}(id: number): Promise<{ data: void }> {
  await fetch(\`\${API_BASE}/\${id}\`, { method: "DELETE" });
  return { data: undefined };
}

export async function get${pascalName}Report(params?: any): Promise<{ data: any }> {
  const res = await fetch(\`\${API_BASE}/report\`, { method: "GET" });
  return { data: await res.json() };
}
`;

  await fs.writeFile(serviceFile, content, "utf-8");
  console.log(`[Frontend] ✅ Service Generated: ${pascalName}`);
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
