// scripts/gen_Perms_Backend_Controllers.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const backendBase = path.resolve("backend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldController(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const controllerFile = path.join(backendBase, domain, resource, "controller.ts");
  await fs.mkdir(path.dirname(controllerFile), { recursive: true });

  const content = `// Auto-generated backend controller for ${pascalName}
import * as service from "./service.js";
import { ${pascalName}ValidationError, ${pascalName}ServiceError } from "./errors.js";

export async function list${pascalName}(req, res) {
  try {
    const result = await service.get${pascalName}List(req.query);
    res.json(result);
  } catch (err) {
    throw new ${pascalName}ServiceError("Failed to list ${pascalName}");
  }
}

export async function get${pascalName}(req, res) {
  try {
    const result = await service.get${pascalName}ById(Number(req.params.id));
    res.json(result);
  } catch (err) {
    throw new ${pascalName}ServiceError("Failed to fetch ${pascalName}");
  }
}

export async function create${pascalName}(req, res) {
  try {
    const result = await service.create${pascalName}(req.body);
    res.json(result);
  } catch (err) {
    throw new ${pascalName}ValidationError("Invalid ${pascalName} data");
  }
}

export async function update${pascalName}(req, res) {
  try {
    const result = await service.update${pascalName}(Number(req.params.id), req.body);
    res.json(result);
  } catch (err) {
    throw new ${pascalName}ValidationError("Invalid update for ${pascalName}");
  }
}

export async function delete${pascalName}(req, res) {
  try {
    const result = await service.delete${pascalName}(Number(req.params.id));
    res.json(result);
  } catch (err) {
    throw new ${pascalName}ServiceError("Failed to delete ${pascalName}");
  }
}
`;

  await fs.writeFile(controllerFile, content, "utf-8");
  console.log(`[Backend] ✅ Controller Generated: ${pascalName}`);
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
