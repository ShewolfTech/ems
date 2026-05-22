// scripts/gen_Perms_Frontend_AuditLogger.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldAuditLogger(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const loggerFile = path.join(frontendBase, domain, resource, "auditLogger.ts");
  await fs.mkdir(path.dirname(loggerFile), { recursive: true });

  const content = `// Auto-generated frontend audit logger for ${pascalName}

export function log${pascalName}Action(userId: number, action: string, details?: any) {
  const entry = {
    timestamp: new Date().toISOString(),
    userId,
    resource: "${resource}",
    action,
    details,
  };
  // TODO: send to backend audit endpoint or analytics
  console.log("[AUDIT-FE]", entry);
}
`;

  await fs.writeFile(loggerFile, content, "utf-8");
  console.log(`[Frontend] ✅ Audit Logger Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldAuditLogger(domain, resource);
    }
  }
}

run().catch(console.error);
