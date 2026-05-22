// scripts/gen_Perms_Frontend_Controllers.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const frontendBase = path.resolve("frontend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldController(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const controllerFile = path.join(frontendBase, domain, resource, "controller.ts");
  await fs.mkdir(path.dirname(controllerFile), { recursive: true });

  const content = `// Auto-generated frontend controller for ${pascalName}
import * as service from "./services.js";
import { ${pascalName}ValidationError, ${pascalName}ServiceError } from "./errors.js";

export async function list${pascalName}(params?: any) {
  try {
    return await service.get${pascalName}List(params);
  } catch (err) {
    throw new ${pascalName}ServiceError("Failed to list ${pascalName}");
  }
}

export async function get${pascalName}(id: number) {
  try {
    return await service.get${pascalName}ById(id);
  } catch (err) {
    throw new ${pascalName}ServiceError("Failed to fetch ${pascalName}");
  }
}

export async function create${pascalName}(data: any) {
  try {
    return await service.create${pascalName}(data);
  } catch (err) {
    throw new ${pascalName}ValidationError("Invalid ${pascalName} data");
  }
}

export async function update${pascalName}(id: number, data: any) {
  try {
    return await service.update${pascalName}(id, data);
  } catch (err) {
    throw new ${pascalName}ValidationError("Invalid update for ${pascalName}");
  }
}

export async function delete${pascalName}(id: number) {
  try {
    return await service.delete${pascalName}(id);
  } catch (err) {
    throw new ${pascalName}ServiceError("Failed to delete ${pascalName}");
  }
}
`;

  await fs.writeFile(controllerFile, content, "utf-8");
  console.log(`[Frontend] ✅ Controller Generated: ${pascalName}`);
}

async function run() {
  const registry = permissionRegistry as Record<string, Record<string, string[]>>;

  for (const domain of Object.keys(registry)) {
    for (const resource of Object.keys(registry[domain])) {
      await scaffoldController(domain, resource);
    }
  }
}

run().catch(console.error);
