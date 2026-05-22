// scripts/gen_Perms_Frontend_Utils.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

async function scaffoldUtils(domain: string, resource: string) {
  const utilsFile = path.join(frontendBase, domain, resource, "utils.ts");
  await fs.mkdir(path.dirname(utilsFile), { recursive: true });

  const content = `// Auto-generated frontend utils for ${resource}

export function expandManage(resource: string, perms: string[]): string[] {
  const expanded: string[] = [];
  for (const p of perms) {
    if (p.endsWith(".manage")) {
      const base = p.replace(".manage", "");
      expanded.push(
        \`\${base}.create\`,
        \`\${base}.read\`,
        \`\${base}.update\`,
        \`\${base}.delete\`,
        \`\${base}.export\`
      );
    } else {
      expanded.push(p);
      if (p.endsWith(".create") || p.endsWith(".update") || p.endsWith(".delete")) {
        expanded.push(\`\${resource}.read\`);
      }
    }
  }
  return Array.from(new Set(expanded));
}
`;

  await fs.writeFile(utilsFile, content, "utf-8");
  console.log(`[Frontend] ✅ Utils Generated: ${resource}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;
  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldUtils(domain, resource);
    }
  }
}

run().catch(console.error);
