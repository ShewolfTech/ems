// scripts/refreshBackendDomains.ts
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env first
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const backendDomainsPath = path.resolve(__dirname, "../backend/src/domains");
const skipDomains = new Set(["auth", "permissions"]);

const toSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, "");

const pascalCase = (str: string) =>
  str.split(/[-_\s]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

// Step 1: Clean backend domains, leaving only auth & permissions
function cleanBackendDomains() {
  const domains = fs.readdirSync(backendDomainsPath);
  domains.forEach((domain) => {
    if (skipDomains.has(domain)) {
      console.log(`⏩ Skipping protected domain: ${domain}`);
      return;
    }
    const fullPath = path.join(backendDomainsPath, domain);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`🗑️ Removed domain: ${domain}`);
  });
}

async function scaffoldDomains() {
  // Import pool dynamically AFTER env is loaded
  const { pool } = await import(
    pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href
  );

  const result = await pool.query(`
    SELECT DISTINCT module, resource, route_type
    FROM route_permissions
    WHERE module IS NOT NULL AND resource IS NOT NULL
  `);

  console.log(`🏗️  Scaffolding ${result.rows.length} domains...`);

  for (const { module, resource, route_type } of result.rows) {
    if (skipDomains.has(resource)) {
      console.log(`  ⏭️ Skipped: ${module}/${resource} (manual domain)`);
      continue;
    }

    const folderName = toSnakeCase(resource);

    let domainPath;
    if (route_type === "view") {
      domainPath = path.join(backendDomainsPath, toSnakeCase(module), "views", folderName);
    } else if (route_type === "report") {
      domainPath = path.join(backendDomainsPath, "reporting", folderName);
    } else {
      domainPath = path.join(backendDomainsPath, toSnakeCase(module), folderName);
    }

    if (!fs.existsSync(domainPath)) {
      fs.mkdirSync(domainPath, { recursive: true });
    }

    const servicePath = path.join(domainPath, "service.ts");
    if (!fs.existsSync(servicePath)) {
      const name = pascalCase(resource);

      let boilerplate;
      if (route_type === "crud") {
        boilerplate = `export class ${name}Service {
  async create(data: any) { /* TODO */ }
  async read(id: string) { /* TODO */ }
  async update(id: string, data: any) { /* TODO */ }
  async delete(id: string) { /* TODO */ }
}
export const ${resource}Service = new ${name}Service();`;
      } else if (route_type === "view") {
        boilerplate = `export class ${name}Service {
  async readAll(params?: any) { /* TODO: query view */ }
}
export const ${resource}Service = new ${name}Service();`;
      } else if (route_type === "report") {
        boilerplate = `export class ${name}Service {
  async generate(params?: any) { /* TODO: run report */ }
}
export const ${resource}Service = new ${name}Service();`;
      } else {
        boilerplate = `export class ${name}Service {
  // Logic for ${resource} goes here
}
export const ${resource}Service = new ${name}Service();`;
      }

      fs.writeFileSync(servicePath, boilerplate);
    }

    console.log(
      `  📁 Created/Verified: ${toSnakeCase(module)}/${
        route_type === "view"
          ? "views/" + folderName
          : route_type === "report"
          ? "reporting/" + folderName
          : folderName
      } (${route_type})`
    );
  }

  await pool.end();
}

async function run() {
  console.log("🧹 Cleaning backend domains...");
  cleanBackendDomains();

  console.log("\n📂 Scaffolding backend domains from route_permissions...");
  await scaffoldDomains();

  console.log("\n✨ Backend domains refreshed successfully!");
}

run().catch((err) => {
  console.error("❌ Error refreshing backend domains:", err);
  process.exit(1);
});
