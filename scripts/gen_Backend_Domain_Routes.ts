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
  try { await fs.access(dirPath); } catch { await fs.mkdir(dirPath, { recursive: true }); }
}

async function run() {
  const dbPath = pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href;
  const { pool } = await import(dbPath);

  const result = await pool.query(`
    SELECT module, resource, route_type, 
           COALESCE(BOOL_OR(is_global) FILTER (WHERE is_global IS TRUE), false) as is_global
    FROM route_permissions
    WHERE module IS NOT NULL AND resource IS NOT NULL
    GROUP BY module, resource, route_type
  `);

  console.log(`📡 Generating Backend Routes for ${result.rows.length} resources...`);

  for (const { module, resource, route_type, is_global } of result.rows) {
    if (["auth", "permissions"].includes(resource)) continue;

    const interfaceName = snakeToPascal(resource);
    const controllerInstance = `${resource.replace(/[^a-zA-Z0-9]/g, "")}Controller`;

    let domainPath =
      route_type === "view"
        ? path.join(domainsBase, module, "views", resource)
        : route_type === "report"
        ? path.join(domainsBase, "reporting", resource)
        : path.join(domainsBase, module, resource);

    await ensureDir(domainPath);

    // Check if this is a global resource
    const isGlobal = is_global === true || is_global === 1 || is_global === 'true' || is_global === '1';

    const menuCheck = await pool.query(
      `SELECT COUNT(*) FROM route_permissions WHERE resource = $1 AND is_menu_item = true`,
      [resource]
    );
    const hasMenuItems = parseInt(menuCheck.rows[0].count, 10) > 0;

    let routesContent = `/**
 * ⚠️ Auto-generated routes for ${interfaceName}
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { ${controllerInstance} } from "./controller.js";

const router = Router();
`;

    // 1. Metadata routes first (to avoid conflicts with :id)
    if (hasMenuItems) {
      routesContent += `
// Metadata Endpoints (Priority)
router.get("/permissions-meta", ${controllerInstance}.getPermissionsMeta.bind(${controllerInstance}));
router.get("/sidebar", ${controllerInstance}.getSidebar.bind(${controllerInstance}));
`;
    }

    // Custom endpoints for specific resources
    if (resource === "leaves") {
      routesContent += `
// Custom Leave Workflow Endpoints
router.get("/approvers", ${controllerInstance}.getApprovers.bind(${controllerInstance}));
`;
    }

    // 2. Data endpoints based on route type AND is_global
    if (route_type === "crud") {
      if (isGlobal) {
        // Global resources - only read operations
        routesContent += `
// Read-Only Endpoints (Global Resource)
router.get("/", ${controllerInstance}.getAll.bind(${controllerInstance}));
router.get("/:id", ${controllerInstance}.getById.bind(${controllerInstance}));
`;
      } else {
        // Tenant-specific resources - full CRUD
        routesContent += `
// Standard CRUD Endpoints
router.get("/", ${controllerInstance}.getAll.bind(${controllerInstance}));
router.get("/:id", ${controllerInstance}.getById.bind(${controllerInstance}));
router.post("/", ${controllerInstance}.create.bind(${controllerInstance}));
router.put("/:id", ${controllerInstance}.update.bind(${controllerInstance}));
router.delete("/:id", ${controllerInstance}.delete.bind(${controllerInstance}));
`;
      }
    } else if (route_type === "view") {
      routesContent += `
// Read-Only View Endpoints
router.get("/", ${controllerInstance}.getAll.bind(${controllerInstance}));
router.get("/:id", ${controllerInstance}.getById.bind(${controllerInstance}));
`;
    } else if (route_type === "report") {
      routesContent += `
// Reporting Endpoints
router.post("/generate", ${controllerInstance}.generate.bind(${controllerInstance}));
`;
    }

    routesContent += `
export default router;
`;

    const filePath = path.join(domainPath, "routes.ts");
    await fs.writeFile(filePath, routesContent, "utf-8");
    console.log(`✅ Route Generated: /${module}/${resource} [${route_type}]${isGlobal ? ' (GLOBAL)' : ''}`);
  }

  await pool.end();
  console.log("\n✨ Backend route generation complete.");
}

run().catch(console.error);
