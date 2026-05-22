// scripts/gen_Perms_Frontend_Components.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldComponents(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const compDir = path.join(frontendBase, domain, resource, "components");
  await fs.mkdir(compDir, { recursive: true });

  const gateFile = path.join(compDir, "PermissionGate.tsx");
  const managerFile = path.join(compDir, "RoleManager.tsx");

  const gateContent = `// Auto-generated PermissionGate for ${pascalName}
import { ReactNode } from "react";
import { useHas${pascalName}Permission } from "../hooks";

interface Props {
  permission: string;
  children: ReactNode;
}

export function PermissionGate({ permission, children }: Props) {
  const allowed = useHas${pascalName}Permission(permission);
  return allowed ? <>{children}</> : null;
}
`;

  const managerContent = `// Auto-generated RoleManager for ${pascalName}
import { useState, useEffect } from "react";
import * as controller from "../controller";

export function RoleManager() {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    controller.list${pascalName}().then(res => setRoles(res.data));
  }, []);

  return (
    <div>
      <h2>${pascalName} Roles</h2>
      <ul>
        {roles.map(r => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}
`;

  await fs.writeFile(gateFile, gateContent, "utf-8");
  await fs.writeFile(managerFile, managerContent, "utf-8");

  console.log(`[Frontend] ✅ Components Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;
  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldComponents(domain, resource);
    }
  }
}

run().catch(console.error);
