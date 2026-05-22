// scripts/gen_Perms_Frontend_Validators.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldValidator(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const validatorFile = path.join(frontendBase, domain, resource, "validator.ts");
  await fs.mkdir(path.dirname(validatorFile), { recursive: true });

  const content = `// Auto-generated frontend validator for ${pascalName}
import { z } from "zod";

export const ${pascalName}Schema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.string().optional(), // ISO date string
  updatedAt: z.string().optional(),
});
`;

  await fs.writeFile(validatorFile, content, "utf-8");
  console.log(`[Frontend] ✅ Validator Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldValidator(domain, resource);
    }
  }
}

run().catch(console.error);
