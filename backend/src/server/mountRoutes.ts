import express from "express";
import fs from "fs";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";
import { authRoutes } from "../domains/auth/routes.js";
import permissionRoutes from "../domains/permissions/routes.js";

export const domainRegistry: Record<string, { route: string; filePath: string }> = {};

/**
 * Standardizes the URL and removes redundant module prefixes.
 * Converts academics/academics_studentsgrades_view -> /api/academics/studentsgrades-view
 */
function normalizeApiRoute(baseRoute: string): string {
  if (!baseRoute || baseRoute === "/") return "/api";
  
  const parts = baseRoute.split("/").filter(Boolean);
  
  // CLEANUP LOGIC: If we have [module, resource] and resource starts with module_
  // e.g. ['academics', 'academics_studentsgrades_view']
  if (parts.length > 1) {
    const moduleName = parts[0];
    const lastPart = parts[parts.length - 1];
    
    if (lastPart.startsWith(moduleName + "_")) {
      // Strip the 'academics_' part from the start of the resource name
      parts[parts.length - 1] = lastPart.replace(moduleName + "_", "");
    }
  }

  const kebabPath = parts
    .map(p => p.toLowerCase().replace(/_/g, "-"))
    .join("/");
    
  return `/api/${kebabPath}`;
}

async function scanAndMount(app: express.Application, baseDir: string, baseRoute: string = "") {
  if (!fs.existsSync(baseDir)) return;

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "auth" || entry.name === "permissions") continue;

    const fullPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      // Skip structural folders in the URL path
      if (entry.name === "views" || entry.name === "reporting") {
        await scanAndMount(app, fullPath, baseRoute);
      } else {
        const newBaseRoute = baseRoute ? `${baseRoute}/${entry.name}` : `/${entry.name}`;
        await scanAndMount(app, fullPath, newBaseRoute);
      }
    } else if (entry.isFile() && (entry.name === "routes.js" || entry.name === "routes.ts")) {
      try {
        const module = await import(pathToFileURL(fullPath).href);
        const routes = module.default;

        if (routes) {
          const apiRoute = normalizeApiRoute(baseRoute || "/");
          
          if (!domainRegistry[apiRoute]) {
            app.use(apiRoute, routes);
            domainRegistry[apiRoute] = { route: apiRoute, filePath: fullPath };
            console.log(`✅ Mounted: ${apiRoute}`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed to mount ${fullPath}:`, err);
      }
    }
  }
}

export async function mountRoutes(app: express.Application) {
  // Manual Mounts
  app.use("/api/auth", authRoutes);
  app.use("/api/permissions", permissionRoutes);

  // Auto Scan
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const domainsDir = path.resolve(__dirname, "../domains");
  
  console.log(`🚀 Starting domain scan...`);
  await scanAndMount(app, domainsDir);
}