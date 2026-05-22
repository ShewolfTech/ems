// scripts/gen_Perms_Frontend_Hooks.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldHooks(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const hooksFile = path.join(frontendBase, domain, resource, "hooks.ts");
  await fs.mkdir(path.dirname(hooksFile), { recursive: true });

  const content = `// Auto-generated frontend hooks for ${pascalName}
import { useContext } from "react";
import { PermissionsContext } from "../PermissionsProvider";

export function use${pascalName}Permissions() {
  return useContext(PermissionsContext);
}

export function useHas${pascalName}Permission(permission: string) {
  const { userPermissions } = use${pascalName}Permissions();
  return userPermissions.includes(permission);
}
`;

  await fs.writeFile(hooksFile, content, "utf-8");
  console.log(`[Frontend] ✅ Hooks Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;
  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldHooks(domain, resource);
    }
  }
}

run().catch(console.error);
