// scripts/gen_Perms_Backend_Routes.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { permissionRegistry } from "../../backend/src/registries/permissions/permissionRegistry.ts";

const backendBase = path.resolve("backend/src/domains");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function scaffoldRoutes(domain: string, resource: string) {
  const pascalName = capitalize(resource);
  const routesFile = path.join(backendBase, domain, resource, "routes.ts");
  await fs.mkdir(path.dirname(routesFile), { recursive: true });

  const content = `// Auto-generated backend routes for ${pascalName}
import { Router } from "express";
import * as controller from "./controller.js";

const router = Router();

router.get("/", controller.list${pascalName});
router.get("/:id", controller.get${pascalName});
router.post("/", controller.create${pascalName});
router.put("/:id", controller.update${pascalName});
router.delete("/:id", controller.delete${pascalName});

// Optional: report endpoint
router.get("/report", controller.list${pascalName});

export default router;
`;

  await fs.writeFile(routesFile, content, "utf-8");
  console.log(`[Backend] ✅ Routes Generated: ${pascalName}`);
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
