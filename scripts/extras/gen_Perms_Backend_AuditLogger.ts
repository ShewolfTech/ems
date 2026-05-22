// scripts/gen_Perms_Backend_AuditLogger.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const backendBase = path.resolve("backend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldAuditLogger(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const loggerFile = path.join(backendBase, domain, resource, "auditLogger.ts");
  await fs.mkdir(path.dirname(loggerFile), { recursive: true });

  const content = `// Auto-generated backend audit logger for ${pascalName}

export function log${pascalName}Action(userId: number, action: string, details?: any) {
  const entry = {
    timestamp: new Date(),
    userId,
    resource: "${resource}",
    action,
    details,
  };
  // TODO: persist to audit log storage (DB, file, external system)
  console.log("[AUDIT]", entry);
}
`;

  await fs.writeFile(loggerFile, content, "utf-8");
  console.log(`[Backend] ✅ Audit Logger Generated: ${pascalName}`);
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
