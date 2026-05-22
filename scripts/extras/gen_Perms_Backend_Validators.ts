// scripts/gen_Perms_Backend_Validators.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const backendBase = path.resolve("backend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldValidator(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const validatorFile = path.join(backendBase, domain, resource, "validator.ts");
  await fs.mkdir(path.dirname(validatorFile), { recursive: true });

  const content = `// Auto-generated backend validator for ${pascalName}
import { z } from "zod";

export const ${pascalName}Schema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
`;

  await fs.writeFile(validatorFile, content, "utf-8");
  console.log(`[Backend] ✅ Validator Generated: ${pascalName}`);
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
