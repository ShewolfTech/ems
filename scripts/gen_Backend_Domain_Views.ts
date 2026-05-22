// scripts/gen_Backend_Domain_Views.ts
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const domainsBase = path.resolve(__dirname, "../backend/src/domains");

const snakeToPascal = (str: string) =>
  str.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function run() {
  const { pool } = await import(
    pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href
  );

  const result = await pool.query(`
    SELECT DISTINCT module, resource, route_type,
           COALESCE(BOOL_OR(is_global) FILTER (WHERE is_global IS TRUE), false) as is_global
    FROM route_permissions
    WHERE route_type = 'view'
    GROUP BY module, resource, route_type
  `);

  console.log(`📡 Generating Plumbing (Service/Controller/Routes) for ${result.rows.length} views...`);

  for (const { module, resource } of result.rows) {
    const interfaceName = snakeToPascal(resource);
    const serviceInstance = `${resource.replace(/[^a-zA-Z0-9]/g, "")}Service`;
    const controllerInstance = `${resource.replace(/[^a-zA-Z0-9]/g, "")}Controller`;

    const domainPath = path.join(domainsBase, module, "views", resource);
    await ensureDir(domainPath);

    // --- 🛡️ Note: types.ts and validator.ts are managed by gen_Backend_Domain_Validators.ts

    // --- service.ts ---
    // Fix 2: Changed to ${interfaceName}Schema to match your main validator output
    const serviceContent = `import { db } from "../../../../config/infra/database.js";
import { ${interfaceName}Schema } from "./validator.js";

export class ${interfaceName}Service {
  async findAll(params?: any) {
    const parsed = ${interfaceName}Schema.parse(params);
    return await db.selectFrom("${resource}" as any).selectAll().execute();
  }

  async findById(id: number | string) {
    return await db.selectFrom("${resource}" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .executeTakeFirst();
  }
}

export const ${serviceInstance} = new ${interfaceName}Service();
`;
    await fs.writeFile(path.join(domainPath, "service.ts"), serviceContent, "utf-8");

    // --- controller.ts ---
    const menuCheck = await pool.query(
      `SELECT COUNT(*) FROM route_permissions WHERE resource = $1 AND is_menu_item = true`,
      [resource]
    );
    const hasMenuItems = parseInt(menuCheck.rows[0].count, 10) > 0;

    let controllerContent = `import { Request, Response } from "express";
import { ${serviceInstance} } from "./service.js";

export class ${interfaceName}Controller {
  async getAll(req: Request, res: Response) {
    try {
      const data = await ${serviceInstance}.findAll(req.query);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await ${serviceInstance}.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: "Record not found" });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
`;

    if (hasMenuItems) {
      controllerContent += `
  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const data = await ${serviceInstance}.findAll(req.query);
      const enriched = data.map((p: any) => ({
        display_name: p.display_name,
        icon: p.icon,
        is_menu_item: p.is_menu_item,
        display_order: p.display_order,
      }));
      res.json({ success: true, permissions_meta: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSidebar(req: Request, res: Response) {
    try {
      const data = await ${serviceInstance}.findAll(req.query);
      const sidebar = data
        .filter((p: any) => p.is_menu_item)
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
      res.json({ success: true, sidebar });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
`;
    }

    controllerContent += `}
export const ${controllerInstance} = new ${interfaceName}Controller();
`;
    await fs.writeFile(path.join(domainPath, "controller.ts"), controllerContent, "utf-8");

    // --- routes.ts ---
    let routesContent = `import { Router } from "express";
import { ${controllerInstance} } from "./controller.js";

const router = Router();

router.get("/", ${controllerInstance}.getAll.bind(${controllerInstance}));
router.get("/:id", ${controllerInstance}.getById.bind(${controllerInstance}));
`;

    if (hasMenuItems) {
      routesContent += `
router.get("/permissions-meta", ${controllerInstance}.getPermissionsMeta.bind(${controllerInstance}));
router.get("/sidebar", ${controllerInstance}.getSidebar.bind(${controllerInstance}));
`;
    }

    routesContent += `
export default router;
`;
    await fs.writeFile(path.join(domainPath, "routes.ts"), routesContent, "utf-8");

    console.log(`✅ View Plumbing Updated: ${interfaceName}`);
  }

  await pool.end();
  console.log("\n🎉 Views plumbing complete. Run the Validator script now to fix type errors!");
}

run().catch(console.error);