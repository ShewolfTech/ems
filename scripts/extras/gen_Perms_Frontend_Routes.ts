// scripts/gen_Perms_Frontend_Routes.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldRoutes(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const routesFile = path.join(frontendBase, domain, resource, "routes.ts");
  await fs.mkdir(path.dirname(routesFile), { recursive: true });

  const content = `// Auto-generated frontend routes for ${pascalName}
// These can be used with React Router or similar

export const ${pascalName}Routes = {
  list: "/${domain}/${resource}",
  detail: (id: number) => \`/${domain}/${resource}/\${id}\`,
  create: "/${domain}/${resource}/create",
  update: (id: number) => \`/${domain}/${resource}/\${id}/edit\`,
};
`;

  await fs.writeFile(routesFile, content, "utf-8");
  console.log(`[Frontend] ✅ Routes Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldRoutes(domain, resource);
    }
  }
}

run().catch(console.error);
