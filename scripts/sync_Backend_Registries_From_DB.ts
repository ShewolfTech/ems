// 📁 scripts/syncRegistriesFromDB.ts
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables from the backend folder
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const backendRegistriesPath = path.resolve(__dirname, "../backend/src/registries");
const backendUtilsPath = path.resolve(__dirname, "../backend/src/utils");

// NEW: shared registries path
const sharedRegistriesPath = path.resolve(__dirname, "../shared/src/registries");

interface PermissionRow {
  module: string;
  resource: string;
  action: string;
}

// Helper to write to backend and optionally shared
function writeFileSafe(filePath: string, content: string, alsoShared = false) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✨ Wrote: ${filePath}`);

  if (alsoShared) {
    // Mirror relative path into shared registries
    const relative = path.relative(backendRegistriesPath, filePath);
    const sharedFilePath = path.join(sharedRegistriesPath, relative);
    fs.mkdirSync(path.dirname(sharedFilePath), { recursive: true });
    fs.writeFileSync(sharedFilePath, content, "utf-8");
    console.log(`✨ Wrote (shared): ${sharedFilePath}`);
  }
}

// Helper to append .js extension for ESM/NodeNext compatibility
function withJsExt(p: string) {
  return p.endsWith(".js") ? p : `${p}.js`;
}

async function main() {
  let pool: any;
  try {
    const dbPath = path.resolve(__dirname, "../shared/src/db/database.ts");
    const dbModule = await import(pathToFileURL(dbPath).href);
    pool = dbModule.pool;

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is undefined. Check your .env file.");
    }

    console.log("🔄 Fetching and cleaning Module/Resource/Action data...");

    const result = await pool.query(`
      SELECT DISTINCT module, resource, action
      FROM public.route_permissions
      WHERE is_active = true
        AND module IS NOT NULL
        AND resource IS NOT NULL
        AND action IS NOT NULL
      ORDER BY module, resource, action
    `);

    const rows = result.rows as PermissionRow[];

    if (rows.length === 0) {
      console.warn("⚠️ No permissions found in route_permissions.");
    }

    // --- permissionsEnum.ts ---
    const enumLines = rows.map((r: PermissionRow) => {
      const key = `${r.module}_${r.resource}_${r.action}`
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase()
        .replace(/_{2,}/g, "_")
        .replace(/^_+|_+$/g, "");
      const value = `${r.module}:${r.resource}:${r.action}`;
      return `  ${key} = "${value}",`;
    });

    const uniqueEnumLines = Array.from(new Set(enumLines));
    const enumContent = `export enum Permissions {\n${uniqueEnumLines.join("\n")}\n}\n`;

    writeFileSafe(
      path.join(backendRegistriesPath, "permissions", "permissionsEnum.ts"),
      enumContent,
      true // also write to shared
    );

    // --- permissionRegistry.ts ---
    const registry: Record<string, Record<string, string[]>> = {};
    for (const row of rows) {
      registry[row.module] ??= {};
      registry[row.module][row.resource] ??= [];
      if (!registry[row.module][row.resource].includes(row.action)) {
        registry[row.module][row.resource].push(row.action);
      }
    }
    const registryContent = `export const permissionRegistry = ${JSON.stringify(registry, null, 2)};\n`;
    writeFileSafe(
      path.join(backendRegistriesPath, "permissions", "permissionRegistry.ts"),
      registryContent,
      true
    );

    // --- domainTree.ts ---
    const tree: Record<string, string[]> = {};
    for (const row of rows) {
      tree[row.module] ??= [];
      if (!tree[row.module].includes(row.resource)) {
        tree[row.module].push(row.resource);
      }
    }
    const treeContent = `export const domainTree = ${JSON.stringify(tree, null, 2)};\n`;
    writeFileSafe(path.join(backendRegistriesPath, "domainTree.ts"), treeContent, true);

    // --- compositeResources.ts ---
    const compositeResourcesContent = `
// Auto-generated composite resources
import { permissionRegistry } from ${JSON.stringify(withJsExt("./permissions/permissionRegistry"))};

export const compositeResources: Record<string, string[]> = Object.keys(permissionRegistry).reduce((acc, module) => {
  acc[module] = Object.keys((permissionRegistry as Record<string, any>)[module]);
  return acc;
}, {} as Record<string, string[]>);
`;
    writeFileSafe(
      path.join(backendRegistriesPath, "compositeResources.ts"),
      compositeResourcesContent,
      true
    );

    // --- registry.ts ---
    const registryBarrelContent = `
// Auto-generated registry barrel
export * from ${JSON.stringify(withJsExt("./compositeResources"))};
export * from ${JSON.stringify(withJsExt("./domainTree"))};
export * from ${JSON.stringify(withJsExt("./permissions/index"))};
export * from ${JSON.stringify(withJsExt("./ui/index"))};
`;
    writeFileSafe(path.join(backendRegistriesPath, "registry.ts"), registryBarrelContent, true);

    // --- permissions/index.ts ---
    const permissionsIndexContent = `
// Auto-generated permissions barrel
export * from ${JSON.stringify(withJsExt("./permissionsEnum"))};
export * from ${JSON.stringify(withJsExt("./permissionRegistry"))};
export * from ${JSON.stringify(withJsExt("./permissions"))};
`;
    writeFileSafe(
      path.join(backendRegistriesPath, "permissions", "index.ts"),
      permissionsIndexContent,
      true
    );

    // --- permissions/permissions.ts ---
    const permissionsHelperContent = `
// Auto-generated permissions helper
import { Permissions } from ${JSON.stringify(withJsExt("./permissionsEnum"))};

export const allPermissions = Object.values(Permissions);
`;
    writeFileSafe(
      path.join(backendRegistriesPath, "permissions", "permissions.ts"),
      permissionsHelperContent,
      true
    );

    // --- ui/dashboardConfig.ts ---
    const dashboardConfigContent = `
// Auto-generated dashboard config
export const dashboardConfig = {
  widgets: []
};
`;
    writeFileSafe(path.join(backendRegistriesPath, "ui", "dashboardConfig.ts"), dashboardConfigContent);

    // --- ui/menuConfig.ts ---
    const menuConfigContent = `
// Auto-generated menu config
export const menuConfig = {
  items: []
};
`;
    writeFileSafe(path.join(backendRegistriesPath, "ui", "menuConfig.ts"), menuConfigContent);

    // --- ui/index.ts ---
    const uiIndexContent = `
// Auto-generated UI barrel
export * from ${JSON.stringify(withJsExt("./dashboardConfig"))};
export * from ${JSON.stringify(withJsExt("./menuConfig"))};
`;
    writeFileSafe(path.join(backendRegistriesPath, "ui", "index.ts"), uiIndexContent);

    // --- registries/index.ts ---
    const registriesIndexContent = `
// Auto-generated registries barrel
export * from ${JSON.stringify(withJsExt("./compositeResources"))};
export * from ${JSON.stringify(withJsExt("./domainTree"))};
export * from ${JSON.stringify(withJsExt("./permissions/index"))};
export * from ${JSON.stringify(withJsExt("./ui/index"))};
`;
    writeFileSafe(path.join(backendRegistriesPath, "index.ts"), registriesIndexContent, true);

    // --- utils/index.ts ---
    const utilsIndexContent = `
// Auto-generated utils barrel
export * from ${JSON.stringify(withJsExt("./compose"))};
export * from ${JSON.stringify(withJsExt("./date"))};
export * from ${JSON.stringify(withJsExt("./diff"))};
`;
    writeFileSafe(path.join(backendUtilsPath, "index.ts"), utilsIndexContent);

    console.log("🎉 All registries and utils synced successfully to backend + shared.");
  } catch (err: any) {
    console.error("❌ Sync failed:", err.message || err);
  } finally {
    if (pool) await pool.end();
    process.exit(0);
  }
}

main();
