import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const frontendDomainsPath = path.resolve("frontend/src/domains");
const backendDomainsPath = path.resolve("backend/src/domains");
const skipDomains = new Set(["auth", "permissions"]);

type RouteType = "crud" | "view" | "report";

const baseKeepFiles: Record<RouteType, string[]> = {
  crud: ["types.ts", "validator.ts", "errors.ts", "services.ts", "controller.ts"],
  view: ["types.ts", "validator.ts", "services.ts", "controller.ts"], // no errors.ts
  report: ["types.ts", "validator.ts"],
};

const baseKeepFolders: Record<RouteType, string[]> = {
  crud: ["hooks", "components", "pages"],
  view: ["hooks", "components", "pages"],
  report: ["pages"],
};

function refreshDomain(domainPath: string, displayName: string, routeType: RouteType) {
  const keepFiles: Set<string> = new Set(baseKeepFiles[routeType]);
  const keepFolders: Set<string> = new Set(baseKeepFolders[routeType]);

  if (!fs.existsSync(domainPath)) fs.mkdirSync(domainPath, { recursive: true });

  // 1. Create Files
  keepFiles.forEach((file) => {
    const filePath = path.join(domainPath, file);
    if (!fs.existsSync(filePath)) {
      let content = `// ${file} for ${displayName}\n`;

      if (routeType === "view" && file === "services.ts") {
        const serviceName = displayName.replace(/[^a-zA-Z0-9]/g, "");
        content = `// services.ts for ${displayName} (read-only)
import axios from "axios";

const API_BASE = "/api/${displayName}";

export const ${serviceName}Service = {
  getList: () => axios.get(API_BASE),
  getById: (id: string | number) => axios.get(\`\${API_BASE}/\${id}\`),
};
`;
      }

      if (routeType === "view" && file === "controller.ts") {
        const serviceName = displayName.replace(/[^a-zA-Z0-9]/g, "");
        content = `// controller.ts for ${displayName} (read-only)
import * as service from "./services";

export async function loadList() {
  return (await service.${serviceName}Service.getList()).data;
}

export async function loadById(id: string | number) {
  return (await service.${serviceName}Service.getById(id)).data;
}
`;
      }

      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Created File: ${path.relative(frontendDomainsPath, filePath)}`);
    }
  });

  // 2. Create Folders
  keepFolders.forEach((folder) => {
    const folderPath = path.join(domainPath, folder);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  });

}

async function run() {
  console.log("🧹 Wiping old frontend domains...");
  if (fs.existsSync(frontendDomainsPath)) {
    fs.readdirSync(frontendDomainsPath).forEach(d => {
      if (!skipDomains.has(d)) fs.rmSync(path.join(frontendDomainsPath, d), { recursive: true, force: true });
    });
  }

  const { pool } = await import(pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href);
  const result = await pool.query(`SELECT DISTINCT module FROM route_permissions WHERE module IS NOT NULL`);
  const modules = result.rows.map((r: { module: string }) => r.module.toLowerCase());
  
  let crudCount = 0, viewCount = 0, reportCount = 0;

  for (const module of modules) {
    const bModulePath = path.join(backendDomainsPath, module);
    if (!fs.existsSync(bModulePath)) continue;

    console.log(`📂 Scanning Module: ${module}`);

    // Scan all items inside the backend module folder
    const items = fs.readdirSync(bModulePath, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;

      if (item.name === "views") {
        // 🚀 Handle the 'views' folder directly under the module
        const bViewsPath = path.join(bModulePath, "views");
        const viewList = fs.readdirSync(bViewsPath).filter(v => fs.statSync(path.join(bViewsPath, v)).isDirectory());

        viewList.forEach(v => {
          const fViewPath = path.join(frontendDomainsPath, module, "views", v);
          refreshDomain(fViewPath, `${module}/views/${v}`, "view");
          viewCount++;
        });
      } else {
        // Standard Resource (e.g., academics/assignments)
        const fResourcePath = path.join(frontendDomainsPath, module, item.name);
        refreshDomain(fResourcePath, `${module}/${item.name}`, "crud");
        crudCount++;
      }
    }
  }

  await pool.end();
  console.log(`\n✨ Frontend Refresh Complete.`);
  console.log(`   CRUD scaffolded: ${crudCount}`);
  console.log(`   Views scaffolded: ${viewCount}`);
  console.log(`   Reports scaffolded: ${reportCount}`);
}

run().catch(console.error);
