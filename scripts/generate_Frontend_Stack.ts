import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const frontendBase = path.resolve(__dirname, "../frontend/src/domains");

const capitalize = (s: string) =>
  s.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase()).replace(/_/g, "");

const getSafeName = (s: string) => capitalize(s).replace(/[\s\-_]+/g, "");

async function run() {
  try {
    const dbPath = pathToFileURL(
      path.resolve(__dirname, "../shared/src/db/database.ts"),
    ).href;
    const { pool } = await import(dbPath);
    const { rows } = await pool.query(
      "SELECT DISTINCT module, resource, route_type FROM route_permissions WHERE module IS NOT NULL",
    );

    console.log(`🧠 Smart Alignment: Analyzing ${rows.length} patterns...`);

    for (const row of rows) {
      const { module, resource, route_type } = row;
      if (module === "auth") continue;

      const pascalName = getSafeName(resource);
      const segments = [module];

      if (route_type === "view") segments.push("views");
      if (route_type === "report") segments.push("reporting");
      segments.push(resource);

      const targetPath = path.join(frontendBase, ...segments);

      try {
        await fs.access(path.join(targetPath, "types.ts"));
      } catch {
        continue; // Skip if the folder isn't ready
      }

      const moduleUrl = module.replace(/_/g, "-");
      let resourceUrl = resource.replace(/_/g, "-");

      // --- CRITICAL FIX: CLEAN URL LOGIC ---
      // This matches the new Backend mountRoutes.ts normalization.
      // If resource is 'academics-studentsgrades-view', it becomes 'studentsgrades-view'
      if (resourceUrl.startsWith(moduleUrl + "-")) {
        resourceUrl = resourceUrl.replace(moduleUrl + "-", "");
      }

      let apiEndpoint: string;
      if (route_type === "report") {
        apiEndpoint = `/${moduleUrl}/reports/${resourceUrl}`;
      } else {
        // Aligns with: /api/academics/studentsgrades-view
        apiEndpoint = `/${moduleUrl}/${resourceUrl}`;
      }

      await fs.mkdir(path.join(targetPath, "hooks"), { recursive: true });

      // --- Service Layer ---
      const service = `import api from "@/utils/api.js";

export const get${pascalName}List = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("${apiEndpoint}", { params: queryParams }).then(res => res.data);
};

export const get${pascalName}Meta = () => 
  api.get("${apiEndpoint}/permissions-meta").then(res => res.data);

export const get${pascalName}Sidebar = () => 
  api.get("${apiEndpoint}/sidebar").then(res => res.data);

export const save${pascalName} = (data: any) => 
  data.id ? api.put(\`\${"${apiEndpoint}"}/\${data.id}\`, data) : api.post("${apiEndpoint}", data);

export const remove${pascalName} = (id: any) => 
  api.delete(\`\${"${apiEndpoint}"}/\${id}\`);`;

      // --- Controller Layer ---
      const controller = `import * as service from "./services.js";

export const load${pascalName}List = (p?: any) => service.get${pascalName}List(p);
export const load${pascalName}Meta = () => service.get${pascalName}Meta();
export const load${pascalName}Sidebar = () => service.get${pascalName}Sidebar();
export const save${pascalName} = (d: any) => service.save${pascalName}(d);
export const remove${pascalName} = (id: any) => service.remove${pascalName}(id);`;

      // --- Hook Layer ---
      const hook = `import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";

export function use${pascalName}({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const reload = useCallback(async (p?: any) => {
    setLoading(true);
    try {
      const res = await controller.load${pascalName}List(p || params);
      // Handle wrapped response { success: true, data: [...] }
      setData(res?.data || (Array.isArray(res) ? res : []));
      setMeta(res?.meta || { page: 1, totalPages: 1 });
    } catch (err) { 
      console.error("Error in use${pascalName}:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { if (autoFetch) reload(); }, [autoFetch, reload]);

  return { 
    data, 
    loading, 
    meta, 
    reload, 
    save: controller.save${pascalName}, 
    remove: controller.remove${pascalName},
    loadMeta: controller.load${pascalName}Meta,
    loadSidebar: controller.load${pascalName}Sidebar,
  };
}`;

      await fs.writeFile(path.join(targetPath, "services.ts"), service);
      await fs.writeFile(path.join(targetPath, "controller.ts"), controller);
      await fs.writeFile(
        path.join(targetPath, "hooks", `use${pascalName}.ts`),
        hook,
      );

      console.log(`🔗 Aligned: [${module}/${resource}] -> ${apiEndpoint}`);
    }

    execSync(
      `npx prettier --write "${frontendBase}/**/{services,controller,hooks}/*.ts" --loglevel warn`,
    );
    console.log("✅ Frontend Alignment complete.");
  } catch (err) {
    console.error("❌ Fatal Error:", err);
  } finally {
    process.exit(0);
  }
}
run();
